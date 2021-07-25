import firebase from "firebase-admin";
import serviceAccount from "./privateKey.json";

firebase.initializeApp({
  credential: firebase.credential.cert({
    projectId: serviceAccount.project_id,
    privateKey: serviceAccount.private_key,
    clientEmail: serviceAccount.client_email,
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
