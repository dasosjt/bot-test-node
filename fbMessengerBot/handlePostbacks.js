"use strict"
const sendMessage = require('./fbMessage/sendMessage');
const handleWitMessages = require('./handleWitMessages');


module.exports = function (senderId, postback) {
    console.log("HandlePostBacks");

    sendMessage(senderId, {
        text : "Postback from " + senderId + ": " + JSON.stringify(postback)
    });

    handleWitMessages.setContext(senderId, "forecast", "sunny");



};
