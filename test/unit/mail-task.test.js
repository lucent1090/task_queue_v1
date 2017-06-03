'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'

import fs from 'fs'
import mailtask from '../mail-task'
import smtp from '../smtp-server'
import kueServer from '../kue-server'

describe('mail-task test', () => {
  describe('setWorker function', () => {
    let mailServer,
        taskServer,
        config,
        fakeTaskFile,
        setJobTypeListSpy,
        getTransporterStub

    before(() => {
      mailServer = smtp()
      taskServer = kueServer()
      setJobTypeListSpy = sinon.spy(taskServer, 'setJobTypeList')
      getTransporterStub = sinon.stub(mailServer, 'getTransporter')
      getTransporterStub.returns({
        connectionTimeout: 3000
      })
      
      config = JSON.parse( fs.readFileSync('./src/config.json') )

      fakeTaskFile = {
        type: 'TEST',
        kue_config: {
          MAX_PROCESS_JOB: null
        },
        transporter: null,
        worker: () => {},
        setConfig: (config) => {
          this.kue_config = config.kue_config.MAX_PROCESS_JOB
        }
      }
    })

    it('should')
  })
})
