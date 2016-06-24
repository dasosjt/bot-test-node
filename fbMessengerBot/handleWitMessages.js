"use strict"
var sendMessage = require('./fbMessage/sendMessage');
var fbMessage = require('./fbMessage/fbMessage');
/*var Wit = require('node-wit').Wit;

const WIT_TOKEN = "K57OVGCGBAXTLARG6MLHCHFRAEXKII6A";*/



// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

// Wit.ai bot specific code

const findOrCreateSession = (senderId) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].senderId === senderId) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {senderId: senderId, context: {}};
  }
  return sessionId;
};

// Our bot actions
/*const actions = {
  say(sessionId, context, message, cb) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].fbid;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      fbMessage(recipientId, message, (err, data) => {
        if (err) {
          console.log(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err
          );
        }

        // Let's give the wheel back to our bot
        cb();
      });
    } else {
      console.log('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      cb();
    }
  },
  merge(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
};*/

// Setting up our bot
/*const wit = new Wit(WIT_TOKEN, actions);*/



module.exports = function (config) {
  var senderId = config.senderId;
  var message = config.message.split(' ');

  // We retrieve the user's current session, or create one if it doesn't exist
  // This is needed for our bot to figure out the conversation history
  const sessionId = findOrCreateSession(senderId);


  var textReply = new fbMessage
      .PlainText("SenderId: " + senderId +" SessionId: "+sessionId+" Message: " + JSON.stringify(message))
      .compose();

  sendMessage(senderId, textReply);

}
