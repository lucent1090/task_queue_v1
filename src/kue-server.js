'use strict'

import kue from 'kue'
import { EventEmitter } from 'events'

export default function kueServer () {
  let queue = null
  let redisError = false
  let lastEnterTime = 0
  let jobTypeList = []
  let em = new EventEmitter()

  function create (kue_config, redis_config) {
    // redis set up
    let redisConfig = {};
    if (process.env.NODE_ENV === 'production') {
      redisConfig = {
        redis: {
          port: process.env.REDIS_PORT,
          host: process.env.REDIS_HOST,
          auth: process.env.REDIS_PASS,
          options: {
            retry_strategy: function (options) {
            if (options.error && options.error.code === 'ECONNREFUSED') {
                // End reconnecting on a specific error and flush all commands with a individual error
                return new Error('The server refused the connection');
            }
            if (options.total_retry_time > redis_config.REDIS_RETRY_TIMEOUT) {
                // End reconnecting after a specific timeout and flush all commands with a individual error
                return new Error('Retry time exhausted');
            }
            if (options.attempt > redis_config.REDIS_RETRY_ATTEMPT) {
                // End reconnecting with built in error
                return undefined;
            }
            // reconnect after
            return Math.min(options.attempt * 100, redis_config.REDIS_RETRY_TIME);
            }
          }
        }
      }
    }

    return new Promise((resolve, reject) => {
      // create new queue
      queue = kue.createQueue(redisConfig);
      try {
        kue.app.listen(kue_config.PORT);
        console.log('kue UI on port ' + kue_config.PORT);
      } catch (err) {
        console.log('kue-server: cannot start kue express server', err);
      }

      //check redis connection
      queue.client.on('ready', () => {
        console.log('redis is ready');
        redisError = false;
        lastEnterTime = 0;
        resolve()
      })
      queue.client.on('error', (err) => {
        redisError = true;
        reject(err)
      })

    })
  }

  function initSetting () {
    // check redis periodically in case unstable redis connection
    queue.watchStuckJobs(6000);

    // catch queue error
    queue.on('error', (err) => {
      let date = Date.getHours() + Date.getMinutes() + Date.getSeconds()
      if( (date - lastEnterTime) > 30 ){
        console.log(err)
        lastEnterTime = date
      }
    })

    queue.on('job enqueue', (id, type) => {
      if( !jobTypeList.includes(type) ){
        kue.Job.get(id, (err, job) => {
          if (err) return;
          console.log('Unregistered job type: ', type)
          job.state('failed').save()
        })
      }
    })

  }

  function finishRemove () {
    em.emit('kue-server-jobRemove-done')
  }

  function addJobTypeList (type) {
    if( ! jobTypeList.includes(type)  ){
      jobTypeList.push(type)
    }
  }

  function getJobTypeList () {
    return jobTypeList
  }

  function getQueue () {
    return queue
  }

  function isRedisError () {
    return redisError
  }

  function close () {
    queue.shutdown( 1, function(err) {
      console.log( 'kue-server: shutdown: ', err||'ok' )
    })
  }

  return {
    create,          // create queue
    initSetting,     // init error callback
    getQueue,
    close,           // close queue
    setJobClean,     // function: clean complete job
    setFailedJobRedo,// function: redo failed job
    addJobTypeList,  // function: regist job type
    getJobTypeList,
    isRedisError,    // redis error flag
    em               // event emitter
  }
}
