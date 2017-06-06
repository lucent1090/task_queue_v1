'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'

import fs from 'fs'
import kue from 'kue'
import kueServer from '../kue-server'

describe('create and initSetting', () => {
  let taskServer, createQueueSpy, config

  before(() => {
    process.env.NODE_ENV = 'production'
    createQueueSpy = sinon.spy(kue, 'createQueue')

    taskServer = kueServer()
    config = JSON.parse( fs.readFileSync('src/config.json') )
  })
  after(() => {
    createQueueSpy.restore()
    delete process.env.NODE_ENV
  })

  it('should call kue.createQueue with redisConfig', () => {
    taskServer.create(config)

    expect(createQueueSpy.called).to.be.true
    expect(createQueueSpy.args[0][0].redis).to.not.empty
  })
  it('should add callbacks on redis', () => {
    let queue = taskServer.getQueue()

    expect(queue.client._events).to.include.keys('error')
    expect(queue.client._events).to.include.keys('ready')
  })
  it('should add callbacks on queue', () => {
    let queue = taskServer.getQueue()
    let watchStuckJobsSpy = sinon.spy(queue, 'watchStuckJobs')
    taskServer.initSetting()

    expect(queue._events).to.include.keys('error')
    expect(queue._events).to.include.keys('job enqueue')
    expect(watchStuckJobsSpy.called).to.be.true
    watchStuckJobsSpy.restore()
  })
})

describe('setJobTypeList', () => {
  let taskServer

  before(() => {
    taskServer = kueServer()
    taskServer.addJobTypeList('type 1')
  })

  it('should add one more joy type', () => {
    taskServer.addJobTypeList('type 2')

    expect(taskServer.getJobTypeList().length).to.equal(2)
  })
  it('should not add one more job type', () => {
    taskServer.addJobTypeList('type 1')

    expect(taskServer.getJobTypeList().length).to.equal(2)
  })
})
