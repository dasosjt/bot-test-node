"use strict"
const APP_TOKEN = require('./config/appToken');
const fetch = require('node-fetch');

const WIT_TOKEN = '2NG2AYCDR7NN2OFMDA2IYEPDIL4MWN6S';

let Wit = null;
let log = null;
Wit = require('node-wit').Wit;
log = require('node-wit').log;

const sendTextMessage = (id, text, quick_replies) => {
  if(quick_replies){
    console.log("We got a quick reply", JSON.parse(quick_replies));

  }
  const body = JSON.stringify({
    recipient: { id },
    message: { text, quick_replies },
  });
  const qs = APP_TOKEN;
  return fetch('https://graph.facebook.com/me/messages?access_token=' + qs, {
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

//Search for entities
const firstEntityValue = (entities, entity) => {
  const val = entities && entities[entity] &&
    Array.isArray(entities[entity]) &&
    entities[entity].length > 0 &&
    entities[entity][0].value
  ;
  if (!val) {
    return null;
  }
  return typeof val === 'object' ? val.value : val;
};

/// Our bot actions
const actions = {
  send({sessionId, context, entities}, {text, quickreplies}) {
    // Our bot has something to say!
    // Let's retrieve the Facebook user whose session belongs to
    const recipientId = sessions[sessionId].senderId;
    console.log("Entities: ", entities);
    console.log("Context: ",sessions[sessionId].context);
    console.log("QuickReplies: ", quickreplies);
    sessions[sessionId].context = context;
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      return sendTextMessage(recipientId, text, quickreplies)
      .then(() => null)
      .catch((err) => {
        console.error(
          'Oops! An error occurred while forwarding the response to',
          recipientId,
          ':',
          err.stack || err
        );
      });
    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
};

// Setting up our bot
const wit = new Wit({
  accessToken: WIT_TOKEN,
  actions,
  logger: new log.Logger(log.INFO)
});

module.exports = function (config) {
  var senderId = config.senderId;
  var message = config.message;

  // We retrieve the user's current session, or create one if it doesn't exist
  // This is needed for our bot to figure out the conversation history
  const sessionId = findOrCreateSession(senderId);
  // We received a text message

  // Let's forward the message to the Wit.ai Bot Engine
  // This will run all actions until our bot has nothing left to do
  wit.runActions(
    sessionId, // the user's current session
    message, // the user's message
    sessions[sessionId].context // the user's current session state
  ).then((context) => {
    // Our bot did everything it has to do.
    // Now it's waiting for further messages to proceed.
    console.log('Waiting for next user messages');

    // Based on the session state, you might want to reset the session.
    // This depends heavily on the business logic of your bot.
    // Example:
    // if (context['done']) {
    //   delete sessions[sessionId];
    // }

    // Updating the user's current session state
    sessions[sessionId].context = context;
  })
  .catch((err) => {
    console.error('Oops! Got an error from Wit: ', err.stack || err);
  })
}
