export const testConfig = {
  successNewsletter: {
    "type": 'SEND_NEWSLETTER',
    "data": {
      "title": "success news letter",
      "to": "mail",
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
        "to": "mail",
        "template": "<body><h3>task queue test</h3></body>"
      }
    },

    emptyField: {
      "type": 'SEND_NEWSLETTER',
      "data": {
        "title": "",
        "to": "mail",
        "template": "<body><h3>task queue test</h3></body>"
      }
    }
  },
  successVerifyMail: {
    "type": 'SEND_VERIFY_MAIL',
    "data": {
      "title": "success verify mail",
      "to": "mail",
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
        "to": "mail",
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
        "to": "mail",
        "template": "<body><h3>task queue test</h3></body>"
      },
      "options": {
        "priority": "high"
      }
    }
  },

  createJobUrl: 'http://localhost:3000/job',
  getQueueState: 'http://localhost:3000/stats',

  fakeConfig: {
    "kue_config": {
      "PORT": 3000,
      "SHUTDOWN_DELAY": 1,
      "MAX_PROCESS_JOB": 5
    },
    "redis_config": {
      "REDIS_RETRY_TIMEOUT": 60000,
      "REDIS_RETRY_ATTEMPT": 10,
      "REDIS_RETRY_TIME": 3000
    },
    "mail_options": {
      "feedbackName": "feedbackName"
    },
    "smtp_config": {
      "SMTPUsername": "user_name",
      "SMTPPassword": "user_password",
      "SMTPServer": "smtp.office365.com",
      "SMTPPort": "587",
      "connectionTimeout": 300000,
      "maxConnection": 5,
      "maxReconnectAttempts": 5
    }
  },

  delayCheckMailTime: 5,

  mailLogin: {
    user: 'user_name',
    password: 'user_password'
  }
}
