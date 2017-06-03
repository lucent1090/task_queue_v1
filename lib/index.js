'use strict';

var _mailTask = require('./mail-task');

var _mailTask2 = _interopRequireDefault(_mailTask);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mailTask = (0, _mailTask2.default)();
mailTask.start();