export const newsletter = {
  type: 'SEND_NEWSLETTER',
  mail_options: {
    feedbackName: null
  },
  smtp_config: {
    SMTPUsername: null
  },
  transporter: null,
  worker: function (job, done) {
    let self = this
    let data = job.data
    if( (data.to=='') || (data.title=='') || (data.template=='') ) {
      done( new Error('email cannot send with empty field') )
      return
    }

    let mailOptions = {
      // sender address must be the same as SMTP username
      from: `"${self.mail_options.feedbackName}" <${self.smtp_config.SMTPUsername}>`, // sender address
      to: data.to, // receiver address
      subject: data.title,
      html: data.template // html content
    }

    let promise = new Promise ((resolve, reject) => {
      self.transporter.sendMail(mailOptions, (err, success) => {
        if(err){
          reject(err)
        }else{
          resolve()
        }
      })
    })
    promise.then(() => {
      done()
    }, (err) => {
      done(err)
    })
  },
  setConfig: function (config) {
    this.mail_options.feedbackName = config.mail_options.feedbackName
    this.smtp_config.SMTPUsername = config.smtp_config.SMTPUsername
  }
}
