import firebase from "firebase-admin";
import { project_id, private_key, client_email } from "./privatekey";

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: project_id,
    privateKey: private_key,
    clientEmail: client_email,
  }),
});
const fcm = firebase.messaging();

async function sendNotification(
  topic: string,
  payload: firebase.messaging.MessagingPayload
) {
  const result = await fcm.sendToTopic(topic, payload, { collapseKey: topic });
  console.log(result.messageId);
}

export default sendNotification;
