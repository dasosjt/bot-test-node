var sendMessage = require('./fbMessage/sendMessage');
var fbMessage = require('./fbMessage/fbMessage');

var handleBotCommands = require('./handleBotCommands');
var handleSlashCommands = require('./handleSlashCommands');
var handleWitMessages = require('./handleWitMessages');

var debugMode = require('./config/debugMode');

module.exports = function (senderId, message) {
    var messageText = message.text;

    if (debugMode.getDebugMode(senderId)) {
        var textReply = new fbMessage
            .PlainText("[DEBUG] SenderId: " + senderId + " Message JSON: " + JSON.stringify(message))
            .compose();

        sendMessage(senderId, textReply);
    }else if (messageText.toLowerCase().substr(0, 5) === '@bot ') {

        handleBotCommands({
            senderId : senderId,
            command : messageText.toLowerCase().substr(5)
        });

    }else if (messageText.substr(0, 1) === '/') {

        handleSlashCommands({
            senderId : senderId,
            command : messageText.toLowerCase().substr(1)
        });

    } else {
      handleWitMessages({
          senderId : senderId,
          message : messageText.toLowerCase()
      });
    }


};
