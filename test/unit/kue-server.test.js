'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'

import fs from 'fs'
import kue from 'kue'
import kueServer from '../kue-server'

describe('kue-server test', () => {

  describe('create function', () => {
    let taskServer, createQueueSpy, config

    before(() => {
      process.env.NODE_ENV = 'production'
      createQueueSpy = sinon.spy(kue, 'createQueue')

      taskServer = kueServer()
      config = JSON.parse( fs.readFileSync('./src/config.json') )
      taskServer.setConfig(config)
    })
    after(() => {
      createQueueSpy.restore()
      delete process.env.NODE_ENV
    })

    it('should call kue.createQueue with redisConfig', () => {
      taskServer.create()
      expect(createQueueSpy.called).to.be.true
      expect(createQueueSpy.args[0][0].redis).to.not.empty
    })
    it('should add callbacks on redis and queue', () => {
      let queue = taskServer.getQueue()
      expect(queue.client._events).to.include.keys('error')
      expect(queue.client._events).to.include.keys('ready')
      expect(queue._events).to.include.keys('error')
      expect(queue._events).to.include.keys('ready')
      expect(queue._events).to.include.keys('job enqueue')
    })
  })
})
