'use strict'

import { describe, it, before, after } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import superAgent from 'superagent'
import Imap from 'imap'
import fs from 'fs'

import mailtask from '../mail-task'
import { newsletter } from '../task/newsletter'
import { verifymail } from '../task/verifymail'
import { testConfig } from './testConfig'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('send mail succes', function () {
  let mailtaskServer
  before(function (done) {
    mailtaskServer = mailtask.create()
    mailtaskServer.addWorker(newsletter)
    mailtaskServer.addWorker(verifymail)
    mailtaskServer.on('mail-task-ready', () => {
      done()
    })
  })

  it('should receive newsletter', function () {

  })
  it('should receive verify mail', function () {})
})
// describe('send verify mail failed', function () {
//   it('should not receive verify mail if invalid address', function () {})
//   it('should not receive verify mail if empty field', function () {})
//   it('should not receive verify mail if no smtp connection', function () {})
// })
// describe('send newsletter failed', function () {
//   it('should not receive newsletter if invalid address', function () {})
//   it('should not receive newsletter if empty field', function () {})
// })
// describe('clean complete job', function () {})
// describe('redo failed job', function () {})
