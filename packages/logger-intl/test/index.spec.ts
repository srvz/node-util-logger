import Logger from '../src/index'

describe('normal', () => {
  it(`output logs`, done => {
    class Log extends Logger {
      buildLogger(logType: string) {
        if (this.cache.has(logType)) return this.cache.get(logType)

        this.cache.set(logType, {
          accessLog: console.log,
          errorLog: console.error,
        })

        return this.cache.get(logType)
      }
    }

    const loggerClient = new Log('logs', new Map())
    try {
      const logger = loggerClient.getLogger('test')
      logger.access({ msg: 'test' })
      logger.error(new Error('test error'), { msg: 'test' })
    } catch (e) {
      console.log(e)
    }
    done()
  })
})
