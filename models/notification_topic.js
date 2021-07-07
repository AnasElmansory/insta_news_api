const mongo = require("mongoose");
const Schema = mongo.Schema;

const notificationSchema = new Schema({
  topic: String,
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

module.exports = Notification;
