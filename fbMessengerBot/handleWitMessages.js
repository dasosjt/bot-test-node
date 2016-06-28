"use strict"
var sendMessage = require('./fbMessage/sendMessage');
var fbMessage = require('./fbMessage/fbMessage');
var Wit = require('node-wit').Wit;

const WIT_TOKEN = "K57OVGCGBAXTLARG6MLHCHFRAEXKII6A";



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
const actions = {
  say(sessionId, context, message, cb) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].senderId;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.

      var botReply = new fbMessage
          .PlainText(message)
          .compose();

      sendMessage(recipientId, botReply);

      /*fbMessage(recipientId, message, (err, data) => {
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
      });*/

    } else {
      console.log('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
    }
    cb();
  },
  merge(sessionId, context, entities, message, cb) {
    cb(context);
  },
  error(sessionId, context, error) {
    console.log(error.message);
  },
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
};

// Setting up our bot
const wit = new Wit(WIT_TOKEN, actions);


module.exports = function (config) {
  var senderId = config.senderId;
  var message = config.message;
  console.log("Message before sended to Wit: ",message);

  // We retrieve the user's current session, or create one if it doesn't exist
  // This is needed for our bot to figure out the conversation history
  const sessionId = findOrCreateSession(senderId);

  // We received a text message

  // Let's forward the message to the Wit.ai Bot Engine
  // This will run all actions until our bot has nothing left to do
  wit.runActions(
    sessionId, // the user's current session
    message, // the user's message
    sessions[sessionId].context, // the user's current session state
    (error, context) => {
      if (error) {
        console.log('Oops! Got an error from Wit:', error);
      } else {
        // Our bot did everything it has to do.
        // Now it's waiting for further messages to proceed.
        console.log('Waiting for futher messages.');

        // Based on the session state, you might want to reset the session.
        // This depends heavily on the business logic of your bot.
        // Example:
        // if (context['done']) {
        //   delete sessions[sessionId];
        // }

        // Updating the user's current session state
        sessions[sessionId].context = context;
      }
    }
  );
}
