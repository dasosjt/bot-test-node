"use strict"
const sendMessage = require('./fbMessage/sendMessage');
const HandleWitMessages = require('.HandleWitMessages');


module.exports = function (senderId, postback) {
    console.log("HandlePostBacks");

    sendMessage(senderId, {
        text : "Postback from " + senderId + ": " + JSON.stringify(postback)
    });

    HandleWitMessages.setContext(senderId, "forecast", "sunny");



};
