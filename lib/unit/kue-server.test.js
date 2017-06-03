'use strict';

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _chai = require('chai');

var _mocha = require('mocha');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _kue = require('kue');

var _kue2 = _interopRequireDefault(_kue);

var _kueServer = require('../kue-server');

var _kueServer2 = _interopRequireDefault(_kueServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _mocha.describe)('kue-server test', function () {

  (0, _mocha.describe)('create function', function () {
    var taskServer = void 0,
        createQueueSpy = void 0,
        config = void 0;

    (0, _mocha.before)(function () {
      process.env.NODE_ENV = 'production';
      createQueueSpy = _sinon2.default.spy(_kue2.default, 'createQueue');

      taskServer = (0, _kueServer2.default)();
      config = JSON.parse(_fs2.default.readFileSync('./src/config.json'));
      taskServer.setConfig(config);
    });
    (0, _mocha.after)(function () {
      createQueueSpy.restore();
      delete process.env.NODE_ENV;
    });

    (0, _mocha.it)('should call kue.createQueue with redisConfig', function () {
      taskServer.create();
      (0, _chai.expect)(createQueueSpy.called).to.be.true;
      (0, _chai.expect)(createQueueSpy.args[0][0].redis).to.not.empty;
    });
    (0, _mocha.it)('should add callbacks on redis and queue', function () {
      var queue = taskServer.getQueue();
      (0, _chai.expect)(queue.client._events).to.include.keys('error');
      (0, _chai.expect)(queue.client._events).to.include.keys('ready');
      (0, _chai.expect)(queue._events).to.include.keys('error');
      (0, _chai.expect)(queue._events).to.include.keys('ready');
      (0, _chai.expect)(queue._events).to.include.keys('job enqueue');
    });
  });
});