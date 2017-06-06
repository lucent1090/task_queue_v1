export const testConfig = {
  successNewsletter: {
    "type": 'SEND_NEWSLETTER',
    "data": {
      "title": "success news letter",
      "to": "shihyen@twreporter.org",
      "template": "<body><h3>task queue test</h3></body>"
    },
    "options": {
      "attempts": 5
    }
  },
  failedNewsletter: {

    invalidAddress: {
      "type": 'SEND_NEWSLETTER',
      "data": {
        "title": "failed newsletter",
        "to": "shihyentwreporter.org",
        "template": "<body><h3>task queue test</h3></body>"
      }
    },

    emptyField: {
      "type": 'SEND_NEWSLETTER',
      "data": {
        "title": "",
        "to": "shihyen@twreporter.org",
        "template": "<body><h3>task queue test</h3></body>"
      }
    }
  },
  successVerifyMail: {
    "type": 'SEND_VERIFY_MAIL',
    "data": {
      "title": "success verify mail",
      "to": "shihyen@twreporter.org",
      "template": "<body><h3>task queue test</h3></body>"
    },
    "options": {
      "attempts": 5,
      "priority": "high"
    }
  },
  failedVerifyMail: {

    invalidAddress: {
      "type": 'SEND_VERIFY_MAIL',
      "data": {
        "title": "failed verify mail",
        "to": "shihyentwreporter.org",
        "template": "<body><h3>task queue test</h3></body>"
      },
      "options": {
        "priority": "high"
      }
    },

    emptyField: {
      "type": 'SEND_VERIFY_MAIL',
      "data": {
        "title": "",
        "to": "shihyen@twreporter.org",
        "template": "<body><h3>task queue test</h3></body>"
      },
      "options": {
        "priority": "high"
      }
    }
  },

  createJobUrl: 'http://localhost:3030/job',
  getQueueState: 'http://localhost:3030/stats',

  fakeConfig: {
    "kue_config": {
      "PORT": 3030,
      "CLEAN_INTERVAL": 40000,
      "FAILEDJOB_REDO_INTERVAL": 50000,
      "SHUTDOWN_DELAY": 60000,
      "MAX_PROCESS_JOB": 5
    },
    "redis_config": {
      "REDIS_RETRY_TIMEOUT": 60000,
      "REDIS_RETRY_ATTEMPT": 10,
      "REDIS_RETRY_TIME": 3000
    },
    "mail_options": {
      "feedbackName": "報導者 The Reporter"
    },
    "smtp_config": {
      "SMTPUsername": "newsletter-twreporter@outlook.com",
      "SMTPPassword": "testAccount4SendingMail",
      "SMTPServer": "smtp.office365.com",
      "SMTPPort": "587",
      "connectionTimeout": 300000,
      "maxConnection": 5,
      "maxReconnectAttempts": 5
    }
  },

  delayCheckMailTime: 5,

  mailLogin: {
    user: 'shihyen@twreporter.org',
    password: 'vul3rm03'
  }
}
