'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = mailTask;

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _smtpServer = require('./smtp-server');

var _smtpServer2 = _interopRequireDefault(_smtpServer);

var _kueServer = require('./kue-server');

var _kueServer2 = _interopRequireDefault(_kueServer);

var _newsletter = require('./task/newsletter');

var _verifymail = require('./task/verifymail');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function mailTask() {
  var mailServer = void 0,
      taskServer = void 0,
      config = void 0;

  function start() {
    // load config
    try {
      config = JSON.parse(_fs2.default.readFileSync('./src/config.json'));
    } catch (err) {
      console.log(err);
    }

    // init smtp
    mailServer = (0, _smtpServer2.default)();
    mailServer.setConfig(config);
    mailServer.create

    // init kue
    ();taskServer = (0, _kueServer2.default)();
    taskServer.setConfig(config);
    taskServer.create

    // set default worker
    ();setWorker(_newsletter.newsletter);
    setWorker(_verifymail.verifymail

    // process error handling
    );process.once('uncaughtException', function (err) {
      console.log('maile-task: uncaught exception, exit process', err);
      process.exit(0);
    });
  }

  function setWorker(taskFile) {
    taskServer.setJobTypeList(taskFile.type);
    taskFile.setConfig(config);

    if ('transporter' in taskFile) {
      taskFile.transporter = mailServer.getTransporter();
    }

    if ('taskServer' in taskFile) {
      taskFile.taskServer = taskServer;
    }

    taskServer.getQueue().process(taskFile.type, config.kue_config.MAX_PROCESS_JOB, function (job, done) {
      taskFile.worker(job, done);
    });
  }

  return {
    start: start,
    setWorker: setWorker
  };
}