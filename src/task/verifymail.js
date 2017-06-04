export const verifymail = {
  type: 'SEND_VERIFY_MAIL',
  mail_options: {
    feedbackName: null
  },
  smtp_config: {
    SMTPUsername: null
  },
  transporter: null,
  taskServer: null,
  worker: function (job, done) {
    let self = this
    let promise = new Promise(function (resolve, reject) {
      self.transporter.verify((error, success) => {
        if(error){
          reject(error)
        }else{
          resolve()
        }
      })
    })
    promise.then(function () {
      if( !self.taskServer.isRedisError() ){
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

        self.transporter.sendMail(mailOptions, (err, success) => {
          if(err){
            done(err)
          }else{
            done()
          }
        })

      }else{
        console.log('redis connection error')
        job.state('inactive').save()
      }

    }, (err) => {
      console.log(err)
      job.state('inactive').save()
    })

  },
  setConfig: function (config) {
    this.mail_options.feedbackName = config.mail_options.feedbackName
    this.smtp_config.SMTPUsername = config.smtp_config.SMTPUsername
  }
}