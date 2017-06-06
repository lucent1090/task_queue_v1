'use strict'

import mailtask from './mail-task'
import { newsletter } from './task/newsletter'
import { verifymail } from './task/verifymail'

let mailtaskServer = mailtask.create()
mailtaskServer.addWorker(newsletter)
mailtaskServer.addWorker(verifymail)

mailtaskServer.em.on('mail-task-ready', () => {
  console.log('mail-task-ready')
})

mailtaskServer.em.on('mail-task-failed', () => {
  console.log('mail-task-failed')
})
