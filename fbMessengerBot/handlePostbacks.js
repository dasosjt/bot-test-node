var sendMessage = require('./fbMessage/sendMessage');


module.exports = function (senderId, postback) {
    console.log("HandelPostBacks");

    sendMessage(senderId, {
        text : "Postback from " + senderId + ": " + JSON.stringify(postback)
    });



};
