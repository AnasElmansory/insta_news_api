import mongo from "mongoose";
const Schema = mongo.Schema;

const notificationSchema = new Schema({
  topic: String,
  username: String,
  keywords: [
    {
      type: String,
    },
  ],
});

const Notification = mongo.model(
  "notification",
  notificationSchema,
  "notificatinosTopics"
);

export default Notification;
