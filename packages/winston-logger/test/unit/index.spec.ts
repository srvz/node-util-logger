/* eslint-disable import/no-extraneous-dependencies */
import Logger from '../../src/index'

describe('normal', () => {
  it(`output logs`, done => {
    const logger = new Logger('logs', 'test')
    try {
      logger.access({ msg: 'test' })
      logger.error(new Error('test error'), { msg: 'test' })
    } catch (e) {
      console.log(e)
    }
    done()
  })
})
