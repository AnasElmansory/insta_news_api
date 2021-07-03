const firebase = require("firebase-admin");
const serviceAccount = require("./privatekey.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
});
const fcm = firebase.messaging();

async function sendNotification(topic, notification, data) {
  const result = await fcm.sendToTopic(
    topic,
    { notification: notification, data: data },
    { collapseKey: topic }
  );
  console.log(result.messageId);
}

module.exports = sendNotification;
