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

  delayCheckMailTime: 15,

  mailLogin: {
    user: 'shihyen@twreporter.org',
    password: 'vul3rm03'
  }
}
