'use strict'

import mailtask from './mail-task'

import { newsletter } from './task/newsletter'
import { verifymail } from './task/verifymail'

let mailTask = mailtask()
mailTask.start()
mailTask.setWorker(newsletter)
mailTask.setWorker(verifymail)
