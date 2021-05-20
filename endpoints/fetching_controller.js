const router = require("express").Router();
const { stringify } = require("flatted");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const {
  checkFeedingState,
  startTwitFeed,
  stopTwitFeed,
} = require("../utils/tweets_feed_handler");

router.get(
  "/api/control/feeding",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(401).send("have no permission");
    const isFeeding = checkFeedingState();
    res.json({ feeding: isFeeding });
  }
);
router.post(
  "/api/control/startfeeding",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin, max_result } = req.params;
    if (!isAdmin) return res.status(401).send("have no permission");
    const _id = await startTwitFeed();
    const isFeeding = _id !== undefined;
    res.json({ id: stringify(_id), feeding: isFeeding });
  }
);
router.post(
  "/api/control/stopfeeding",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(401).send("have no permission");
    const { result, _id } = stopTwitFeed();
    const isFeeding = _id !== undefined;
    res.json({ result, _id, feeding: isFeeding });
  }
);

module.exports = router;
