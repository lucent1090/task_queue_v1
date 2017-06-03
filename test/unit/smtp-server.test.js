'use strict'

import sinon from 'sinon'
import { expect } from 'chai'
import { describe, it, before, after } from 'mocha'

import fs from 'fs'
import nodemailer from 'nodemailer'
import smtp from '../smtp-server'

describe('SMTP-server test', () => {
  let smtpServer, createTransportSpy, config

  before(() => {
    createTransportSpy = sinon.spy(nodemailer, 'createTransport')

    config = JSON.parse( fs.readFileSync('./src/config.json') )
    smtpServer = smtp()
    smtpServer.setConfig(config)
  })

  after(() => {
    createTransportSpy.restore()
  })

  it('create function should call nodemailer.createTransport', () => {
    smtpServer.create()

    expect(createTransportSpy.called).to.be.true
    expect(smtpServer.getTransporter()).to.not.equal(null)
  })
})
