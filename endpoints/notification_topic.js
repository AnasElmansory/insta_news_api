const router = require("express").Router();
const Notification = require("../models/notification_topic");
const { notificationSchema } = require("../utils/schemas");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");

router.get("/api/notification_topics", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  let { page, pageSize } = req.query;
  if (!page) page = 1;
  if (!pageSize) pageSize = 10;
  const skip = (page - 1) * pageSize;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);

  const notifications = await Notification.find().limit(pageSize).skip(skip);
  res.send(notifications);
});

router.get(
  "/api/notification_topics/search/:topic",
  authorizeUser,
  async (req, res) => {
    const { userId, error, topic } = req.params;
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized : ${error || "something went wrong"}`);
    const notifications = await Notification.find({ topic });
    res.send(notifications);
  }
);

router.put(
  "/api/notification_topics/:topic",
  authorizeUser,
  async (req, res) => {
    const { userId, topic, error } = req.params;
    const { value } = notificationSchema.validate(req.body);
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized : ${error || "something went wrong"}`);
    const notification = await Notification.findOneAndUpdate({ topic }, value, {
      new: true,
    });
    res.send(notification);
  }
);
router.post("/api/notification_topics", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  const { value } = notificationSchema.validate(req.body);
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  const notification = await Notification.create(value);
  res.send(notification);
});
module.exports = router;
