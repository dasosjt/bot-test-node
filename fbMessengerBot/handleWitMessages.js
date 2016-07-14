"use strict"
const textMessage = require('./fbMessage/textMessage');
const qrMessage = require('./fbMessage/quickRepliesMessage');
const attMessage = require('./fbMessage/attachmentMessage');


const WIT_TOKEN = '2NG2AYCDR7NN2OFMDA2IYEPDIL4MWN6S';

let Wit = null;
let log = null;
Wit = require('node-wit').Wit;
log = require('node-wit').log;

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
    if (recipientId) {
      // Yay, we found our recipient!
      // Let's forward our bot response to her.
      // We return a promise to let our bot know when we're done sending
      if (quickreplies) {
        return qrMessage(recipientId, text, quickreplies)
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
        return textMessage(recipientId, text)
        .then(() => null)
        .catch((err) => {
          console.error(
            'Oops! An error occurred while forwarding the response to',
            recipientId,
            ':',
            err.stack || err
          );
        });
      }

    } else {
      console.error('Oops! Couldn\'t find user for session:', sessionId);
      // Giving the wheel back to our bot
      return Promise.resolve()
    }
  },
  // You should implement your custom actions here
  // See https://wit.ai/docs/quickstart
  showMenu({context, entities, sessionId}){
    const recipientId = sessions[sessionId].senderId;
    let test = {
      "type":"template",
      "payload":{
        "template_type":"generic",
        "elements": [{
            "title": "First card",
            "subtitle": "Element #1 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/rift.png",
            "buttons": [{
                "type": "web_url",
                "url": "https://www.messenger.com",
                "title": "web url"
            }, {
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for first element in a generic bubble",
            }],
        }, {
            "title": "Second card",
            "subtitle": "Element #2 of an hscroll",
            "image_url": "http://messengerdemo.parseapp.com/img/gearvr.png",
            "buttons": [{
                "type": "postback",
                "title": "Postback",
                "payload": "Payload for second element in a generic bubble",
            }],
        }]
      }
    }
    console.log("Executing showMenu()");
    return attMessage(recipientId, test)
    .then(() => null)
    .catch((err) => {
      console.error(
        'Oops! An error occurred while forwarding the response to',
        recipientId,
        ':',
        err.stack || err
      );
    });
  },
  getProperty({context, entities, sessionId}){
    console.log("Executing getProperty()");
    return new Promise(function(resolve, reject) {
      if(entities.tipo_propiedad && entities.dimension && entities.zona){
        context.propiedad = 'Hi im the property you are looking for..'
        delete context.no_tipo_propiedad;
      } else if (entities.dimension && entities.zona){
        context.no_tipo_propiedad = true;
        delete context.propiedad;
      }
      return resolve(context);
    });
  },
  showProperty({context, entities, sessionId}){
    console.log("Executing showProperty()");
    const recipientId = sessions[sessionId].senderId;
    return textMessage(recipientId, context.propiedad)
    .then(() => null)
    .catch((err) => {
      console.error(
        'Oops! An error occurred while forwarding the response to',
        recipientId,
        ':',
        err.stack || err
      );
    });
  }
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
  console.log("HandleWitMessages");

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
