'use strict'

import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { describe, it, before, after } from 'mocha'
import sleep from 'sleep'
import superAgent from 'superagent'
import Imap from 'imap'
import fs from 'fs'
import mailtask from '../mail-task'
import { newsletter } from '../task/newsletter'
import { verifymail } from '../task/verifymail'
import { successNewsletter, failedNewsletter,
         successVerifyMail, failedVerifyMail,
         createJobUrl, getQueueState,
         delayCheckMailTime, mailLogin } from './testConfig'

chai.use(chaiAsPromised)
const expect = chai.expect

function getCount (name) {
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
function createJob (job) {
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

describe('task queue', function () {

  describe('send verify mail / newsletter success', function () {
    this.timeout(100000)
    let mailTask

    before(function () {
      mailTask = mailtask()
      mailTask.start()

      mailTask.setWorker(newsletter)
      mailTask.setWorker(verifymail)
    })

    it('should receive verify mail', function () {
      let promise = createJob(successVerifyMail)
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
/*
    it('should receive newsletter', function () {
      let promise = createJob(successNewsletter)
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
*/
  })

  // describe('send verify mail failed', function () {
  //   let failedCount
  //
  //   beforeEach(function () {
  //     return new Promise((resolve, reject) => {
  //       superAgent.get(getQueueState).end((err, res) => {
  //         if(err){
  //           reject(err)
  //         }else{
  //           failedCount = res.body.failedCount
  //           resolve(res.body)
  //         }
  //       })
  //     })
  //   })
  //
  //   it('should not receive verify mail if invalid address', function () {
  //     let curDate = new Date()
  //     let promise = createJob(failedVerifyMail.invalidAddress)
  //     promise = promise.then(() => {
  //       sleep.sleep(delayCheckMailTime)
  //       return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
  //         // return null means reject( new Error('no match mail') )
  //         let mailDate = new Date( buffer.date[0] )
  //         let title = buffer.subject[0]
  //
  //         if( (title == failedVerifyMail.invalidAddress.data.title)
  //           &&((mailDate.getTime() - curDate.getTime()) > 0) ){
  //           // found invalidAddress verify mail
  //           return title
  //         }
  //         return null
  //       })
  //     }, (err) => {
  //       console.log(err)
  //     })
  //
  //     return expect(promise).eventually.be.rejectedWith( 'no match mail' )
  //   })
  //
  //   it('should not receive verify mail if empty field', function () {
  //     let curDate = new Date()
  //     let promise = createJob(failedVerifyMail.emptyField)
  //     promise = promise.then(() => {
  //       sleep.sleep(delayCheckMailTime)
  //       return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
  //         // return null means reject( new Error('no match mail') )
  //         let mailDate = new Date( buffer.date[0] )
  //         let title = buffer.subject[0]
  //
  //         if( (title == failedVerifyMail.emptyField.data.title)
  //           &&((mailDate.getTime() - curDate.getTime()) > 0) ){
  //           // found invalidAddress verify mail
  //           return title
  //         }
  //         return null
  //       })
  //     }, (err) => {
  //       console.log(err)
  //     })
  //
  //     return expect(promise).eventually.be.rejectedWith( 'no match mail' )
  //   })
  //
  //   it('should move to failed queue if failedVerifyMail', function () {
  //     let promise = createJob(failedVerifyMail.invalidAddress)
  //     promise = promise.then(() => {
  //       sleep.sleep(delayCheckMailTime)
  //
  //       return getCount('failedCount')
  //     })
  //
  //     return expect(promise).to.eventually.equal(failedCount+1)
  //   })
  //
  //   //it('should move to inactive queue if verify mail sent without smtp connection', function () {})
  //
  // })
  //
  // describe('send newsletter failed', function () {
  //   let failedCount
  //
  //   beforeEach(function () {
  //     return new Promise((resolve, reject) => {
  //       superAgent.get(getQueueState).end((err, res) => {
  //         if(err){
  //           reject(err)
  //         }else{
  //           failedCount = res.body.failedCount
  //           resolve(res.body)
  //         }
  //       })
  //     })
  //   })
  //
  //   it('should not receive newsletter if invalid address', function () {
  //     let curDate = new Date()
  //     let promise = createJob(failedNewsletter.invalidAddress)
  //     promise = promise.then(() => {
  //       sleep.sleep(delayCheckMailTime)
  //       return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
  //         // return null means reject( new Error('no match mail') )
  //         let mailDate = new Date( buffer.date[0] )
  //         let title = buffer.subject[0]
  //
  //         if( (title == failedNewsletter.invalidAddress.data.title)
  //           &&((mailDate.getTime() - curDate.getTime()) > 0) ){
  //           // found invalidAddress verify mail
  //           return title
  //         }
  //         return null
  //       })
  //     }, (err) => {
  //       console.log(err)
  //     })
  //
  //     return expect(promise).eventually.be.rejectedWith( 'no match mail' )
  //   })
  //
  //   it('should not receive newsletter if empty field', function () {
  //     let curDate = new Date()
  //     let promise = createJob(failedNewsletter.emptyField)
  //     promise = promise.then(() => {
  //       sleep.sleep(delayCheckMailTime)
  //       return getMail('INBOX', 'UNSEEN', 'HEADER.FIELDS (SUBJECT DATE)', function (buffer) {
  //         // return null means reject( new Error('no match mail') )
  //         let mailDate = new Date( buffer.date[0] )
  //         let title = buffer.subject[0]
  //
  //         if( (title == failedNewsletter.emptyField.data.title)
  //           &&((mailDate.getTime() - curDate.getTime()) > 0) ){
  //           // found invalidAddress verify mail
  //           return title
  //         }
  //         return null
  //       })
  //     }, (err) => {
  //       console.log(err)
  //     })
  //
  //     return expect(promise).eventually.be.rejectedWith( 'no match mail' )
  //   })
  //
  //   it('should move to failed queue if failedNewsletter', function () {
  //     let promise = createJob(failedNewsletter.invalidAddress)
  //     promise = promise.then(() => {
  //       sleep.sleep(delayCheckMailTime)
  //
  //       return getCount('failedCount')
  //     })
  //
  //     return expect(promise).to.eventually.equal(failedCount+1)
  //   })
  // })

})
