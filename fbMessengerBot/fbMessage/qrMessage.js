"use strict"
const fetch = require('node-fetch');
const APP_TOKEN = require('../config/appToken');

module.exports = (id, text, quick_replies) => {
  const qr = [];
  for(let i in quick_replies){
    let quick_replies_0 = quick_replies[i].toUpperCase();
    qr.push({
        content_type : "text",
        title : quick_replies[i],
        payload : "PAYLOAD_FOR_PICKING_"+quick_replies_0
      });
  };

  console.log(qr);
  quick_replies = qr;

  const body = JSON.stringify({
    recipient: { id },
    message: { text, quick_replies},
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
