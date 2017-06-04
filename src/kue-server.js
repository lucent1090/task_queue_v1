'use strict'

import kue from 'kue'

export default function kueServer () {
  let kue_config, redis_config
  let queue = null
  let redisError = false
  let lastEnterTime = 0
  let jobTypeList = []

  function create () {
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
        };
      }

      // create new queue
      queue = kue.createQueue(redisConfig);
      try {
        kue.app.listen(kue_config.PORT);
        console.log('kue UI on port ' + kue_config.PORT);
      } catch (err) {
        console.log('kue-server: cannot start kue express server', err);
      }

      // maintain redis connection
      queue.client.on('ready', ()=>{
        console.log('redis is ready');
        redisError = false;
        lastEnterTime = 0;
      }).on('error', (err) => {
        redisError = true;
      });

      // check redis periodically in case unstable redis connection
      queue.watchStuckJobs(6000);

      // catch queue error
      queue.on('error', (err) => {
        let date = Date.getHours() + Date.getMinutes() + Date.getSeconds()
        if( (date - lastEnterTime) > 30 ){
          console.log(err)
          lastEnterTime = date
        }
      });

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

  function setConfig (config) {
    kue_config = config.kue_config
    redis_config = config.redis_config
  }

  function setJobTypeList (type) {
    if( ! jobTypeList.includes(type)  ){
      jobTypeList.push(type)
    }
  }

  function getQueue () {
    return queue;
  }

  function isRedisError () {
    return redisError;
  }

  function setJobClean ( ) {
    function clean () {
      kue.Job.rangeByState('complete', 0, -1, 'asc', (err, completedjobs)=>{
        if( err || (completedjobs.length==0) ){
          console.log('kue-server: get completed job error', err);
          return ;
        }

        console.log('kue-server: clean completed job in task queue');
        completedjobs.forEach((job)=>{
          job.remove();
        });
      });
    }
    setInterval(clean, kue_config.CLEAN_INTERVAL);
  }

  function setFailedJobRedo ( jobType ) {
    function failedRedo () {
      kue.Job.rangeByType(jobType, 'failed', 0, -1, 'asc', (err, failedjobs)=>{
        if( err || (failedjobs.length==0) ){
          console.log('kue-server: get failed job error', err);
          return ;
        }

        console.log('kue-server: redo failed jobs');
        failedjobs.forEach((job)=>{
          job.state('inactive').save();
        });
      });
    }
    setInterval(failedRedo, kue_config.FAILEDJOB_REDO_INTERVAL);
  }

  return {
    create,
    getQueue,
    setConfig,
    setJobClean,
    setFailedJobRedo,
    setJobTypeList,
    isRedisError
  }
}
