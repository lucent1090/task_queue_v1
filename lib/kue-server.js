'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = kueServer;

var _kue = require('kue');

var _kue2 = _interopRequireDefault(_kue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function kueServer() {
  var kue_config = void 0,
      redis_config = void 0;
  var queue = null;
  var redisError = false;
  var lastEnterTime = 0;
  var jobTypeList = [];

  function create() {
    return new Promise(function (resolve, reject) {
      // redis set up
      var redisConfig = {};
      if (process.env.NODE_ENV === 'production') {
        redisConfig = {
          redis: {
            port: process.env.REDIS_PORT,
            host: process.env.REDIS_HOST,
            auth: process.env.REDIS_PASS,
            options: {
              retry_strategy: function retry_strategy(options) {
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
      queue = _kue2.default.createQueue(redisConfig);
      try {
        _kue2.default.app.listen(kue_config.PORT);
        console.log('kue UI on port ' + kue_config.PORT);
      } catch (err) {
        console.log('kue-server: cannot start kue express server', err);
        reject(err);
      }

      // maintain redis connection
      queue.client.on('ready', function () {
        console.log('redis is ready');
        redisError = false;
        lastEnterTime = 0;
      }).on('error', function (err) {
        redisError = true;
      });

      // check redis periodically in case unstable redis connection
      queue.watchStuckJobs(6000);

      // catch queue error
      queue.on('error', function (err) {
        var date = Date.getHours() + Date.getMinutes() + Date.getSeconds();
        if (date - lastEnterTime > 30) {
          console.log(err);
          lastEnterTime = date;
        }
      });

      queue.on('job enqueue', function (id, type) {
        if (jobTypeList.find(type) == undefined) {
          _kue2.default.Job.get(id, function (err, job) {
            if (err) return;
            console.log('Unregistered job type: ', type);
            job.state('failed').save();
          });
        }
      });

      queue.on('ready', function () {
        resolve();
      });
    });
  }

  function setConfig(config) {
    kue_config = config.kue_config;
    redis_config = config.redis_config;
  }

  function setJobTypeList(type) {
    jobTypeList.push(type);
  }

  function getQueue() {
    return queue;
  }

  function isRedisError() {
    return redisError;
  }

  function setJobClean() {
    function clean() {
      _kue2.default.Job.rangeByState('complete', 0, -1, 'asc', function (err, completedjobs) {
        if (err || completedjobs.length == 0) {
          console.log('kue-server: get completed job error', err);
          return;
        }

        console.log('kue-server: clean completed job in task queue');
        completedjobs.forEach(function (job) {
          job.remove();
        });
      });
    }
    setInterval(clean, kue_config.CLEAN_INTERVAL);
  }

  function setFailedJobRedo(jobType) {
    function failedRedo() {
      _kue2.default.Job.rangeByType(jobType, 'failed', 0, -1, 'asc', function (err, failedjobs) {
        if (err || failedjobs.length == 0) {
          console.log('kue-server: get failed job error', err);
          return;
        }

        console.log('kue-server: redo failed jobs');
        failedjobs.forEach(function (job) {
          job.state('inactive').save();
        });
      });
    }
    setInterval(failedRedo, kue_config.FAILEDJOB_REDO_INTERVAL);
  }

  return {
    create: create,
    getQueue: getQueue,
    setConfig: setConfig,
    setJobClean: setJobClean,
    setFailedJobRedo: setFailedJobRedo,
    setJobTypeList: setJobTypeList,
    isRedisError: isRedisError
  };
}