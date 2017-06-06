'use strict'

import nodemailer from 'nodemailer'

export default function smtp () {
  let transporter = null

  function create (smtp_config) {
    return new Promise ((resolve, reject) => {

      transporter = nodemailer.createTransport({
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
      })

      transporter.verify((error, success) => {
        if( error ){
          console.log('SMTP server create error: ', error);
          reject(error)
        }else{
          console.log('SMTP server is ready');
          resolve()
        }
      })
    })

  }

  function getTransporter () {
    return transporter;
  }

  function close () {
    console.log('SMTP server: close')
    transporter.close()
  }

  return {
    create,
    getTransporter,
    close
  }
}
