var sendMessage = require('./fbMessage/sendMessage');


module.exports = function (senderId, postback) {
    console.log("Making a postback");

    sendMessage(senderId, {
        text : "Postback from " + senderId + ": " + JSON.stringify(postback)
    });



};
