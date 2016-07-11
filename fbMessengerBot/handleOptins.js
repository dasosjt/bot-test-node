var sendMessage = require('./fbMessage/sendMessage');


module.exports = function (senderId, optin) {
    console.log("HandleOptins");

    sendMessage(senderId, {
        text : "Option from " + senderId + ": " + JSON.stringify(optin)
    });


};
