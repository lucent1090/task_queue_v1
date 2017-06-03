'use strict';

var _sinon = require('sinon');

var _sinon2 = _interopRequireDefault(_sinon);

var _chai = require('chai');

var _mocha = require('mocha');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

var _smtpServer = require('../smtp-server');

var _smtpServer2 = _interopRequireDefault(_smtpServer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _mocha.describe)('SMTP-server test', function () {
  var smtpServer = void 0,
      createTransportSpy = void 0,
      config = void 0;

  (0, _mocha.before)(function () {
    createTransportSpy = _sinon2.default.spy(_nodemailer2.default, 'createTransport');

    config = JSON.parse(_fs2.default.readFileSync('./src/config.json'));
    smtpServer = (0, _smtpServer2.default)();
    smtpServer.setConfig(config);
  });

  (0, _mocha.after)(function () {
    createTransportSpy.restore();
  });

  (0, _mocha.it)('create function should call nodemailer.createTransport', function () {
    smtpServer.create();

    (0, _chai.expect)(createTransportSpy.called).to.be.true;
    (0, _chai.expect)(smtpServer.getTransporter()).to.not.equal(null);
  });
});