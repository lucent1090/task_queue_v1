'use strict'

import { describe, it, before, after } from 'mocha'
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import superAgent from 'superagent'
import Imap from 'imap'
import fs from 'fs'
import sleep from 'sleep'

import mailtask from '../mail-task'
import { newsletter } from '../task/newsletter'
import { verifymail } from '../task/verifymail'
import { testConfig } from './testConfig'

chai.use(chaiAsPromised)
const expect = chai.expect

describe('mail-task test', function () {
  this.timeout(100000)
  let mailtaskServer

  before(function (done) {
    mailtaskServer = mailtask.create(testConfig.fakeConfig)
    mailtaskServer.addWorker(newsletter)
    mailtaskServer.addWorker(verifymail)
    mailtaskServer.em.on('mail-task-ready', () => {
      done()
    })
  })
  after(function () {
    mailtaskServer.close()
  })

  /*
  describe('send mail succes', function () {

    it('should receive verify mail', function () {
      let successVerifyMail = testConfig.successVerifyMail
      let delayCheckMailTime = testConfig.delayCheckMailTime
      let taskID

      createJob(successVerifyMail)
      let promise = new Promise((resolve, reject) => {

        mailtaskServer.taskServer.getQueue().on('job enqueue', (id, type) => {
          console.log(type, ' ', id)
          taskID = id
        })

        mailtaskServer.taskServer.getQueue().on('job failed', (id, err) => {
          if( id == taskID ){
            reject(err)
          }
        })

        mailtaskServer.taskServer.getQueue().on('job complete', (id, result) => {
          if( id == taskID ){
              console.log(id + ' complete', result)
              resolve()
          }

        })
      })
      promise = promise.then(() => {
        sleep.sleep(delayCheckMailTime)

        return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT)', function (buffer) {
            let title = buffer.subject
            return title[0]
        })
      }, (err) => {
        console.log(err)
      })

      return expect(promise).to.eventually.equal(successVerifyMail.data.title)
    })

    it('should receive newsletter', function () {
      let successNewsletter = testConfig.successNewsletter
      let delayCheckMailTime = testConfig.delayCheckMailTime
      let taskID

      createJob(successNewsletter)
      let promise = new Promise((resolve, reject) => {

        mailtaskServer.taskServer.getQueue().on('job enqueue', (id, type) => {
          console.log(type, ' ', id)
          taskID = id
        })

        mailtaskServer.taskServer.getQueue().on('job failed', (id, err) => {
          if( id == taskID ){
            reject(err)
          }
        })

        mailtaskServer.taskServer.getQueue().on('job complete', (id, result) => {
          if( id == taskID ){
            console.log(id + ' complete', result)
            resolve()
          }

        })
      })
      promise = promise.then(() => {
        sleep.sleep(delayCheckMailTime)

        return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT)', function (buffer) {
            let title = buffer.subject
            return title[0]
        })
      }, (err) => {
        console.log(err)
      })

      return expect(promise).to.eventually.equal(successNewsletter.data.title)
    })

  })
  */
  describe('send verify mail failed', function () {
    let delayCheckMailTime = testConfig.delayCheckMailTime

    it('should not receive verify mail if invalid address', function () {
      let invalidAddress = testConfig.failedVerifyMail.invalidAddress
      let taskID
      let curDate = new Date()

      createJob(invalidAddress)
      let promise = new Promise((resolve, reject) => {

        mailtaskServer.taskServer.getQueue().on('job enqueue', (id, type) => {
          console.log(type, ' ', id)
          taskID = id
        })

        mailtaskServer.taskServer.getQueue().on('job failed', (id, err) => {
          if( id == taskID ){
            console.log(id + 'failed', err)
            reject(err)
          }
        })

        mailtaskServer.taskServer.getQueue().on('job complete', (id, result) => {
          if( id == taskID ){
              console.log(id + ' complete', result)
              resolve()
          }

        })
      })
      promise = promise.then(() => {
      }, (err) => {
        sleep.sleep(delayCheckMailTime)

        return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
          // return null means reject( new Error('no match mail') )
          let mailDate = new Date( buffer.date[0] )
          let title = buffer.subject[0]

          if( (title == invalidAddress.data.title)
            &&((mailDate.getTime() - curDate.getTime()) > 0) ){
            // found invalidAddress verify mail
            return title
          }
          return null
        })
      })

      return expect(promise).eventually.be.rejectedWith( 'no match mail' )
    })
    it('should not receive verify mail if empty field', function () {
      let emptyField = testConfig.failedVerifyMail.emptyField
      let taskID
      let curDate = new Date()

      createJob(emptyField)
      let promise = new Promise((resolve, reject) => {

        mailtaskServer.taskServer.getQueue().on('job enqueue', (id, type) => {
          console.log(type, ' ', id)
          taskID = id
        })

        mailtaskServer.taskServer.getQueue().on('job failed', (id, err) => {
          if( id == taskID ){
            console.log(id + 'failed', err)
            reject(err)
          }
        })

        mailtaskServer.taskServer.getQueue().on('job complete', (id, result) => {
          if( id == taskID ){
              console.log(id + ' complete', result)
              resolve()
          }

        })
      })
      promise = promise.then(() => {
      }, (err) => {
        sleep.sleep(delayCheckMailTime)

        return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
          // return null means reject( new Error('no match mail') )
          let mailDate = new Date( buffer.date[0] )
          let title = buffer.subject[0]

          if( (title == emptyField.data.title)
            &&((mailDate.getTime() - curDate.getTime()) > 0) ){
            // found invalidAddress verify mail
            return title
          }
          return null
        })
      })

      return expect(promise).eventually.be.rejectedWith( 'no match mail' )
    })
  })
  describe('send newsletter failed', function () {
    let delayCheckMailTime = testConfig.delayCheckMailTime

    it('should not receive newsletter if invalid address', function () {
      let invalidAddress = testConfig.failedNewsletter.invalidAddress
      let taskID
      let curDate = new Date()

      createJob(invalidAddress)
      let promise = new Promise((resolve, reject) => {

        mailtaskServer.taskServer.getQueue().on('job enqueue', (id, type) => {
          console.log(type, ' ', id)
          taskID = id
        })

        mailtaskServer.taskServer.getQueue().on('job failed', (id, err) => {
          if( id == taskID ){
            console.log(id + 'failed', err)
            reject(err)
          }
        })

        mailtaskServer.taskServer.getQueue().on('job complete', (id, result) => {
          if( id == taskID ){
              console.log(id + ' complete', result)
              resolve()
          }

        })
      })
      promise = promise.then(() => {
      }, (err) => {
        sleep.sleep(delayCheckMailTime)

        return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
          // return null means reject( new Error('no match mail') )
          let mailDate = new Date( buffer.date[0] )
          let title = buffer.subject[0]

          if( (title == invalidAddress.data.title)
            &&((mailDate.getTime() - curDate.getTime()) > 0) ){
            // found invalidAddress verify mail
            return title
          }
          return null
        })
      })

      return expect(promise).eventually.be.rejectedWith( 'no match mail' )
    })
    it('should not receive newsletter if empty field', function () {
      let emptyField = testConfig.failedNewsletter.emptyField
      let taskID
      let curDate = new Date()

      createJob(emptyField)
      let promise = new Promise((resolve, reject) => {

        mailtaskServer.taskServer.getQueue().on('job enqueue', (id, type) => {
          console.log(type, ' ', id)
          taskID = id
        })

        mailtaskServer.taskServer.getQueue().on('job failed', (id, err) => {
          if( id == taskID ){
            console.log(id + 'failed', err)
            reject(err)
          }
        })

        mailtaskServer.taskServer.getQueue().on('job complete', (id, result) => {
          if( id == taskID ){
              console.log(id + ' complete', result)
              resolve()
          }

        })
      })
      promise = promise.then(() => {
      }, (err) => {
        sleep.sleep(delayCheckMailTime)

        return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
          // return null means reject( new Error('no match mail') )
          let mailDate = new Date( buffer.date[0] )
          let title = buffer.subject[0]

          if( (title == emptyField.data.title)
            &&((mailDate.getTime() - curDate.getTime()) > 0) ){
            // found invalidAddress verify mail
            return title
          }
          return null
        })
      })

      return expect(promise).eventually.be.rejectedWith( 'no match mail' )
    })
  })
  describe('clean complete job', function () {})
  describe('redo failed job', function () {})
})

function createJob (job) {
  let createJobUrl = testConfig.createJobUrl
  return new Promise((resolve, reject) => {
    superAgent.post(createJobUrl)
              .set('Content-Type', 'application/json')
              .send(job)
              .end((err, res) => {
      if( err || !res.ok ){
        console.log(err)
      }else{
        resolve()
      }
    })
  })
}
function getCount (name) {
  let getQueueState = testConfig.getQueueState
  return new Promise((resolve, reject) => {
    superAgent.get(getQueueState).end((err, res) => {
      if(err || !res.ok){
        console.log(err)
        reject(err)
      }else{
        resolve(res.body[name])
      }
    })
  })
}
function getMail (box, state, command, streamCallback) {
  let mailLogin = testConfig.mailLogin
  return new Promise((resolve, reject) => {
    let imap = new Imap({
      user: mailLogin.user,
      password: mailLogin.password,
      host: 'imap.gmail.com',
      port: 993,
      tls: true
    })

    imap.once('ready', () => {
      imap.openBox(box, true, (err, box) => {
        if(err){
            console.log('open inbox error: ', err)
            reject(err)
        }

        imap.search([state], (err1, results) => {
          if(err1 || !results.length){
            console.log('search unseen error: ', err1||'no results')
            reject(err1)
          }
          console.log('unseen mails:', results)
          let latest = [ Math.max(...results) ]
          var f = imap.fetch(latest, { bodies: command })

          f.on('message', function(msg, seqno) {

            msg.on('body', function(stream, info) {
              var buffer = '';
              stream.on('data', function(chunk) {
                buffer += chunk.toString('utf8');
              });
              stream.once('end', function() {
                let value = streamCallback( Imap.parseHeader(buffer) )
                if( value !== null ){
                    resolve( value )
                }else{
                  reject( new Error('no match mail') )
                }
              });
            });
            msg.once('end', function() {
            });

          });

          f.once('error', function(err2) {
            console.log('Fetch error: ' + err2)
            reject(err2)
          });
          f.once('end', function() {
            imap.end()
          });
        })

      })
    })
    imap.once('error', function(err) {
      console.log('imap err: ', err)
      reject(err)
    });
    imap.once('end', function() {
    });
    imap.connect();
  })
}
