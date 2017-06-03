'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var newsletter = exports.newsletter = {
  type: 'SEND_NEWSLETTER',
  mail_options: {
    feedbackName: null
  },
  smtp_config: {
    SMTPUsername: null
  },
  transporter: null,
  worker: function worker(job, done) {
    var _ = this;
    var data = job.data;
    if (data.to == '' || data.title == '' || data.template == '') {
      done(new Error('email cannot send with empty field'));
      return;
    }

    var mailOptions = {
      // sender address must be the same as SMTP username
      from: '"' + _.mail_options.feedbackName + '" <' + _.smtp_config.SMTPUsername + '>', // sender address
      to: data.to, // receiver address
      subject: data.title,
      html: data.template // html content
    };

    var promise = new Promise(function (resolve, reject) {
      _.transporter.sendMail(mailOptions, function (err, success) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    promise.then(function () {
      done();
    }, function (err) {
      done(err);
    });
  },
  setConfig: function setConfig(config) {
    this.mail_options.feedbackName = config.mail_options.feedbackName;
    this.smtp_config.SMTPUsername = config.smtp_config.SMTPUsername;
  }
};