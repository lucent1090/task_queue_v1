'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'

import fs from 'fs'
import nodemailer from 'nodemailer'
import smtp from '../smtp-server'

describe('SMTP-server test', () => {
  let smtpServer, createTransportStub, verifyCBstub, fakeConfig

  before(() => {
    fakeConfig = {
      SMTPUsername: 'testUser'
    }

    verifyCBstub = sinon.stub()
    createTransportStub = sinon.stub(nodemailer, 'createTransport')
    createTransportStub.returns({
      SMTPUsername: 'testUser',
      verify: verifyCBstub
    })
    smtpServer = smtp()

  })

  after(() => {
    createTransportStub.restore()
  })

  it('create function should call nodemailer.createTransport', () => {
    smtpServer.create(fakeConfig)

    expect(createTransportStub.called).to.be.true
    expect(verifyCBstub.called).to.be.true
  })
})
