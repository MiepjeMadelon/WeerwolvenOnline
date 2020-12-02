const moment = require('moment');


function makeMessage(name, msg, role) {
  time = moment().format('h:mm a');
  message = {name: name, time: time, text: msg, role: role};
  return message;
}

module.exports = makeMessage;
