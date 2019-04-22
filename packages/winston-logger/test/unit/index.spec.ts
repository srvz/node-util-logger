/* eslint-disable import/no-extraneous-dependencies */
import Logger from '../../src/index'

describe('normal', () => {
  it(`output logs`, done => {
    const logger = new Logger('logs', 'test', new Map())
    try {
      logger.access({ msg: 'test' })
      logger.error(new Error('test error'), { msg: 'test' })
    } catch (e) {
      console.log(e)
    }
    done()
  })
})
