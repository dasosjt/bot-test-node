"use strict"
const fetch = require('node-fetch');
const APP_TOKEN = require('../config/appToken');

module.exports = (id, text) => {
  const body = JSON.stringify({
    recipient: { id },
    message: { text},
  });
  return fetch('https://graph.facebook.com/me/messages?access_token=' + APP_TOKEN, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body,
  })
  .then(rsp => rsp.json())
  .then(json => {
    if (json.error && json.error.message) {
      throw new Error(json.error.message);
    }
    return json;
  });
};
