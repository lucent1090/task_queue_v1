export const successNewsletter = {
  "type": 'SEND_NEWSLETTER',
  "data": {
    "title": "success news letter",
    "to": "shihyen@twreporter.org",
    "template": "<body><h3>task queue test</h3></body>"
  },
  "options": {
    "attempts": 5
  }
}
export const failedNewsletter = {

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
}
export const successVerifyMail = {
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
}
export const failedVerifyMail = {

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
}
export const createJobUrl = 'http://localhost:3030/job'
export const getQueueState = 'http://localhost:3030/stats'

export const delayCheckMailTime = 15

export const mailLogin = {
  user: 'shihyen@twreporter.org',
  password: 'vul3rm03'
}
