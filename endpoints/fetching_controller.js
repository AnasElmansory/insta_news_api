const router = require("express").Router();
const { stringify } = require("flatted");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const {
  id,
  startTwitFeed,
  stopTwitFeed,
} = require("../utils/twit_req_handler");

router.get("/api/feeding", authorizeUser, authorizeAdmin, async (req, res) => {
  const { isAdmin } = req.params;
  if (!isAdmin) return res.status(401).send("have no permission");
  res.send(id);
});
router.post(
  "/api/startfeeding",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin, max_result } = req.params;
    if (!isAdmin) return res.status(401).send("have no permission");
    const _id = await startTwitFeed();

    res.send(stringify(_id));
  }
);
router.post(
  "/api/stopfeeding",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(401).send("have no permission");
    const result = stopTwitFeed();
    res.send(result);
  }
);

module.exports = router;
