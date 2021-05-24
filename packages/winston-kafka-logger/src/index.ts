import os from 'os'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import winston from 'winston'
import 'winston-daily-rotate-file'
import Cache from '@blued-core/cache-intl'
import KafkaClient from '@blued-core/kafka-client'
import { QconfConf } from '@blued-core/qconf-conf'

const serverIp = os.hostname().replace(/-/g, '.')

type DailyRotateFile = typeof winston.transports & {
  DailyRotateFile: any
}

export default class {
  public logType: string

  private colors: any

  private datePattern = 'YYYY-MM-DD-HH'

  private levels = ['info', 'debug', 'warn', 'error', 'access']

  private kafkaClient: KafkaClient

  private kafkaTopic: QconfConf

  private kafkaMeta = {
    client_ip: '',
    server_ip: serverIp,
    uid: '',
    log_name: 'nodejs-live-log',
    level: 'info',
    request_id: '',
    request_url: '',
    request_type: '',
    request_header: '',
  }

  constructor (
    public logPath: string,
    public cache: Cache,
    public isLocal: boolean = false,
    public opt?: {
      kafka?: {
        cluster: {
          qconf?: string
        },
        topic: { qconf?: string },
        meta: {
          service: string,
          [key: string]: any
        },
        interval?: number
      },
      winston?: {
        path?: string,
        datePattern?: string
      },
      levels?: string[]
    }
  ) {
    if (opt && opt.kafka) {
      this.kafkaMeta = {
        ...this.kafkaMeta,
        ...opt.kafka.meta,
      }
      this.kafkaClient = new KafkaClient(new QconfConf({
        default: opt.kafka.cluster.qconf,
      }), new Map(), isLocal, opt.kafka.interval || 60e3)
      this.kafkaTopic = new QconfConf({
        default: opt.kafka.topic.qconf,
      })
    }
    if (opt && opt.winston) {
      this.logPath = opt.winston.path || this.logPath
      this.datePattern = opt.winston.path || this.datePattern
    }
    if (opt && opt.levels) {
      this.levels = [...new Set([...this.levels, ...opt.levels])]
    }
    if (isLocal) {
      this.colors = require('colors')
    }
  }

  getTopic() {
    return this.kafkaTopic.get('default')
  }

  getLogger(logType: string) {
    const logger = this.buildLogger(logType)
    const { colors, isLocal } = this

    const obj: {
      [method: string]: Function
    } = {
      error: (error: Error, data?: Record<string, any>, meta?: {
        'uid'?: string,
        'client_ip': string,
        'request_id': string,
        'request_url': string,
        'request_type': string,
        'request_header': string
      }) => {
        const err = {
          err_msg: error.message,
          err_name: error.name,
          err_stack: error.stack,
          error,
        }

        const results = { ...err, ...data }

        const raw = {
          ...this.kafkaMeta,
          ...meta,
          time: Date.now(),
          log_name: logType,
          level: 'error',
          description: JSON.stringify(results),
        }
        logger.errorLog(raw)

        // 添加本地环境的colors输出
        if (isLocal) console.error(colors.red(raw))
        if (!this.kafkaClient) return
        this.kafkaClient.getClient('default').send(
          this.getTopic(),
          JSON.stringify(raw),
        )
      },
    }
    this.levels.forEach(level => {
      if (obj[level]) return
      obj[level] = (description: Record<string, any>, meta?: {
        'uid'?: string,
        'client_ip': string,
        'request_id': string,
        'request_url': string,
        'request_type': string,
        'request_header': string
      }) => {
        const raw = {
          ...this.kafkaMeta,
          ...meta,
          time: Date.now(),
          log_name: logType,
          level,
          description: JSON.stringify(description),
        }
        if (isLocal) console.log(colors.green(raw))
        logger.accessLog(raw)
        if (!this.kafkaClient) return
        this.kafkaClient.getClient('default').send(
          this.getTopic(),
          JSON.stringify(raw),
        )
      }
    })
    return obj
  }

  buildLogger(logType: string) {
    if (this.cache.has(logType)) return this.cache.get(logType)

    const { logPath } = this
    if (!fs.existsSync(logPath)) {
      mkdirp.sync(logPath)
    }

    const accessLog = winston.createLogger({
      transports: [
        new (winston.transports as DailyRotateFile).DailyRotateFile({
          filename: path.resolve(logPath, `./%DATE%-${logType}.access.log`),
          datePattern: this.datePattern,
          zippedArchive: true,
          level: 'info',
        }),
      ],
    })

    const errorLog = winston.createLogger({
      transports: [
        new (winston.transports as DailyRotateFile).DailyRotateFile({
          filename: path.resolve(logPath, `./%DATE%-${logType}.error.log`),
          datePattern: `YYYY-MM-DD-HH`,
          zippedArchive: true,
          level: 'error',
        }),
      ],
    })

    this.cache.set(logType, {
      accessLog: accessLog.info.bind(accessLog),
      errorLog: errorLog.error.bind(errorLog),
    })

    return this.cache.get(logType)
  }
}
