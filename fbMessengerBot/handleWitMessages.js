var sendMessage = require('./fbMessage/sendMessage');
var fbMessage = require('./fbMessage/fbMessage');

module.exports = function (config) {
  var senderId = config.senderId;
  var message = config.message.split(' ');

  var textReply = new fbMessage
      .PlainText("SenderId: " + senderId + " Message JSON: " + JSON.stringify(message))
      .compose();

  sendMessage(senderId, textReply);

}
