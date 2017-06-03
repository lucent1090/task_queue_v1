'use strict'

import fs from 'fs'
import smtp from './smtp-server'
import kueServer from './kue-server'

export default function mailTask () {
  let mailServer, taskServer, config

  function start () {
    // load config
    try{
      config = JSON.parse( fs.readFileSync('./src/config.json') )
    } catch (err) {
      console.log(err)
    }

    // init smtp
    mailServer = smtp()
    mailServer.setConfig( config )
    mailServer.create()

    // init kue
    taskServer = kueServer()
    taskServer.setConfig( config )
    taskServer.create()

    // process error handling
    process.once( 'uncaughtException', function(err){
      console.log('maile-task: uncaught exception, exit process', err);
      process.exit( 0 );
    });
  }

  function setWorker (taskFile) {
    taskServer.setJobTypeList(taskFile.type)
    taskFile.setConfig(config)

    if( 'transporter' in taskFile ){
      taskFile.transporter = mailServer.getTransporter()
    }

    if( 'taskServer' in taskFile ){
      taskFile.taskServer = taskServer
    }

    taskServer.getQueue().process(taskFile.type, config.kue_config.MAX_PROCESS_JOB, (job, done) => {
      taskFile.worker(job, done)
    })
  }

  return {
    start,
    setWorker
  }
}
