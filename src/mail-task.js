'use strict'

import fs from 'fs'
import smtp from './smtp-server'
import kueServer from './kue-server'
import { EventEmitter } from 'events'

exports.create = function () {
  let config
  if( arguments.length == 1 ){
    config = arguments[0]
  }else{
    // load config
    try{
      config = JSON.parse( fs.readFileSync('src/config.json') )
    } catch (err) {
      console.log(err)
    }
  }

  // init smtp
  let mailServer = smtp()
  let pSMTP = mailServer.create(config.smtp_config)

  // init kue
  let taskServer = kueServer()
  let pKue = taskServer.create(config.kue_config, config.redis_config)
  taskServer.initSetting()

  let em = new EventEmitter()
  let promise = Promise.all([pSMTP, pKue])
  promise.then(() => {
    em.emit('mail-task-ready')
  }, (err) => {
    em.emit('mail-task-failed')
  })

  // process error handling
  process.once( 'uncaughtException', function(err){
    console.log('mail-task: uncaught exception, exit process', err);
    process.exit( 0 );
  })

  return server(mailServer, taskServer, config, em)
}

function server (mailServer, taskServer, config, em) {
  return {
    mailServer, // smtp connection
    taskServer, // queue server
    config,     // config.json
    addWorker,  // function: add new worker to queue server
    close,      // function: close queue and smtp connection
    em          // function: events
  }
}

function addWorker (taskFile) {
  this.taskServer.addJobTypeList(taskFile.type)
  taskFile.setConfig(this.config)

  if( 'transporter' in taskFile ){
    taskFile.transporter = this.mailServer.getTransporter()
  }

  if( 'taskServer' in taskFile ){
    taskFile.taskServer = this.taskServer
  }

  this.taskServer.getQueue().process(taskFile.type, this.config.kue_config.MAX_PROCESS_JOB, (job, done) => {
    taskFile.worker(job, done)
  })
}

function close () {
  this.taskServer.close()
  this.mailServer.close()
  // process.exit(0)
}
