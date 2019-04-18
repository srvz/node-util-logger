import Logger from '@blued-core/logger-intl'
import fs from 'fs'
import path from 'path'
import mkdirp from 'mkdirp'
import winston from 'winston'
import 'winston-daily-rotate-file'

const loggerCollection: Record<string, any> = {}
type DailyRotateFile = typeof winston.transports & {
  DailyRotateFile: any
}

export default class T extends Logger {
  buildLogger (logPath: string, logType: string) {
    if (!fs.existsSync(logPath)) {
      mkdirp.sync(logPath)
    }

    if (loggerCollection[logType]) return loggerCollection[logType]

    const accessLog = winston.createLogger({
      transports: [
        new (winston.transports as DailyRotateFile).DailyRotateFile({
          filename: path.resolve(logPath, `./%DATE%-${logType}.access.log`),
          datePattern: `YYYY-MM-DD-HH`,
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

    loggerCollection[logType] = {
      accessLog: accessLog.info.bind(accessLog),
      errorLog: errorLog.error.bind(errorLog),
    }

    return loggerCollection[logType]
  }
}