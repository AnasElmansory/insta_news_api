const router = require("express").Router();
const { stringify } = require("flatted");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const {
  id,
  startTwitFeed,
  stopTwitFeed,
} = require("../utils/twit_req_handler");

router.get(
  "/api/control/feeding",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(401).send("have no permission");
    console.log(id);
    const isFeeding = id !== undefined;
    res.json({ id, feeding: isFeeding });
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
    res.json({ _id, feeding: isFeeding });
  }
);
router.post(
  "/api/control/stopfeeding",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(401).send("have no permission");
    const { result, id } = stopTwitFeed();
    const isFeeding = id !== undefined;
    res.json({ result, id, feeding: isFeeding });
  }
);

module.exports = router;
