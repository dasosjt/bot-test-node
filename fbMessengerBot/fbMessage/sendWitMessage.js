"use strict"
const fetch = require('node-fetch');
const APP_TOKEN = require('../config/appToken');

module.exports = function sendMessage(recipientId, messageData, notificationType) {
