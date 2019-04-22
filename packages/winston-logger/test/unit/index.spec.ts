/* eslint-disable import/no-extraneous-dependencies */
import Logger from '../../src/index'

describe('normal', () => {
  it(`output logs`, done => {
    const loggerClient = new Logger('logs', new Map())
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
