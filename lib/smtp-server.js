'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = smtp;

var _nodemailer = require('nodemailer');

var _nodemailer2 = _interopRequireDefault(_nodemailer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function smtp() {
  var smtp_config = null;
  var transporter = null;

  function create() {
    return new Promise(function (resolve, reject) {
      transporter = _nodemailer2.default.createTransport({
        pool: true,
        maxConnections: smtp_config.maxConnection,
        connectionTimeout: smtp_config.connectionTimeout,
        host: smtp_config.SMTPServer,
        port: smtp_config.SMTPPort,
        secure: false, // upgrade later with STARTTLS
        requireTLS: true, // this should force nodemailer to use STARTTLS
        auth: {
          user: smtp_config.SMTPUsername,
          pass: smtp_config.SMTPPassword
        }
      });

      transporter.verify(function (error, success) {
        if (error) {
          console.log('SMTP server create error: ', error);
          reject();
        } else {
          console.log('SMTP server is ready');
          resolve();
        }
      });
    });
  }

  function setConfig(config) {
    smtp_config = config.smtp_config;
  }

  function getTransporter() {
    return transporter;
  }

  return {
    create: create,
    setConfig: setConfig,
    getTransporter: getTransporter
  };
}