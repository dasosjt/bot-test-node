"use strict"

const token = require('../config/appToken');

module.exports = function sendWitMessage(recipientId, messageData) {
      const fbMessage = (recipientId, messageData) => {
        const body = JSON.stringify({
          recipient: { recipientId },
          message: { messageData },
        });
        const qs = 'access_token=' + encodeURIComponent(token);
        return fetch('https://graph.facebook.com/me/messages?' + qs, {
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

        return fbMessage;
};
