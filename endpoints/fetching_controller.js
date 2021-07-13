const router = require("express").Router();
const { stringify } = require("flatted");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const { errorHandler } = require("../utils/helper");
const {
  checkFeedingState,
  startTwitFeed,
  stopTwitFeed,
} = require("../utils/tweets_feed_handler");

router.get(
  "/control/feeding",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const isFeeding = checkFeedingState();
    res.json({ feeding: isFeeding });
  }
);
router.post(
  "/control/startfeeding",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { max_result } = req.query;
    const _id = await startTwitFeed();
    const isFeeding = _id !== undefined;
    res.json({ id: stringify(_id), feeding: isFeeding });
  }
);
router.post(
  "/control/stopfeeding",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { result, _id } = stopTwitFeed();
    const isFeeding = _id !== undefined;
    res.json({ result, _id, feeding: isFeeding });
  }
);

module.exports = router;
