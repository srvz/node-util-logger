
interface Loggers { accessLog: (res: any) => any, errorLog: (res: any) => any }

export interface LoggerIntl {
  logPath: string
  logType: string
  isLocal?: boolean
  access: (data?: Record<string, any>) => void
  error: (data?: Record<string, any>) => void
  buildLogger: (logPath: string, logType: string) => Loggers
}

export default abstract class Logger implements LoggerIntl {
  private colors: any

  private loggers: Loggers

  constructor (public logPath: string, public logType: string, public isLocal: boolean = false) {
    if (isLocal) {
      this.colors = require('colors')
    }

    this.loggers = this.buildLogger(logPath, logType)
  }

  access (data?: Record<string, any>) {
    if (this.isLocal) {
      console.log(this.colors.green(data))
    }
    this.loggers.accessLog(data)
  }

  error (error: Error, data?: Record<string, any>) {
    const err = {
      err_msg: error.message,
      err_name: error.name,
      err_stack: error.stack,
    }

    const results = { ...err, ...data }

    // 添加本地环境的colors输出
    if (this.isLocal) {
      console.error(this.colors.red(results))
    }
    this.loggers.errorLog(results)
  }

  abstract buildLogger (logPath: string, logType: string): Loggers
}