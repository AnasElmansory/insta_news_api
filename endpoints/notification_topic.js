const router = require("express").Router();
const Notification = require("../models/notification_topic");
const { notificationSchema } = require("../utils/schemas");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const { errorHandler } = require("../utils/helper");

router.get(
  "/control/notification/topics",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const notifications = await Notification.find().limit(pageSize).skip(skip);
    res.send(notifications);
  }
);

router.get(
  "/control/notification/topics/search/:topic",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { topic } = req.params;
    const notifications = await Notification.find({
      $or: [{ topic }, { username: { $regex: topic, $options: "i" } }],
    });
    res.send(notifications);
  }
);

router.put(
  "/control/notification/topics",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { value } = notificationSchema.validate(req.body);
    const notification = await Notification.findOneAndUpdate(
      { topic: value.topic },
      { keywords: value.keywords },
      { new: true }
    );
    res.send(notification);
  }
);
router.post(
  "/control/notification/topics",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { value } = notificationSchema.validate(req.body);
    const exists = await Notification.exists({ topic: value.topic });
    if (!exists) {
      const notification = await Notification.create(value);
      res.send(notification);
    } else {
      res.status(409).send("topic already exists!");
    }
  }
);

router.delete(
  "/control/notification/topics/:topic",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { topic } = req.params;
    const notification = await Notification.findOneAndDelete({ topic });
    res.send(notification);
  }
);
module.exports = router;
