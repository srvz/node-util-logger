import Logger from '@blued-core/logger-intl'
import fs from 'fs'
import mkdirp from 'mkdirp'
import winston from 'winston'
import 'winston-daily-rotate-file'

type DailyRotateFile = typeof winston.transports & {
  DailyRotateFile: any
}

export default class extends Logger {
  buildLogger (logType: string) {
    if (this.cache.has(logType)) return this.cache.get(logType)

    const {
      LOG_META_SERVICE: logMetaService,
      LOG_CONSOLE: logConsole,
      LOG_FILE: logFile,
      LOG_FILE_DIRNAME: logFileDirname,
      LOG_FILE_ACCESS_FILENAME: logFileAccessFilename,
      LOG_FILE_ERROR_FILENAME: logFileErrorFilename,
      LOG_FILE_DATE_PATTERN: logFileDatePattern,
      LOG_FILE_MAX_FILES: logFileMaxFiles,
      LOG_FILE_MAX_SIZE: logFileMaxSize,
    } = process.env

    const accessTransports = []
    const errorTransports = []

    accessTransports.push(new winston.transports.Console({
      level: 'info',
      silent: logConsole !== 'true',
    }))
    errorTransports.push(new winston.transports.Console({
      level: 'error',
      silent: logConsole !== 'true',
    }))

    if (logFile !== 'false') {
      let { logPath } = this
      logPath = logFileDirname || logPath
      if (logPath) {
        if (!fs.existsSync(logPath)) {
          mkdirp.sync(logPath)
        }

        accessTransports.push(new (winston.transports as DailyRotateFile).DailyRotateFile({
          filename: logFileAccessFilename || `%DATE%-${logType}.access.log`,
          dirname: logPath,
          datePattern: logFileDatePattern || 'YYYY-MM-DD-HH',
          zippedArchive: true,
          level: 'info',
          maxSize: logFileMaxSize || null,
          maxFiles: logFileMaxFiles || '30d',
        }))

        errorTransports.push(new (winston.transports as DailyRotateFile).DailyRotateFile({
          filename: logFileErrorFilename || `%DATE%-${logType}.error.log`,
          dirname: logPath,
          datePattern: logFileDatePattern || 'YYYY-MM-DD-HH',
          zippedArchive: true,
          level: 'error',
          maxSize: logFileMaxSize || null,
          maxFiles: logFileMaxFiles || '30d',
        }))
      }
    }
    const defaultMeta = logMetaService ? { service: logMetaService } : null
    const accessLog = winston.createLogger({
      defaultMeta,
      transports: accessTransports,
    })

    const errorLog = winston.createLogger({
      defaultMeta,
      transports: errorTransports,
    })

    this.cache.set(logType, {
      accessLog: accessLog.info.bind(accessLog),
      errorLog: errorLog.error.bind(errorLog),
    })

    return this.cache.get(logType)
  }
}