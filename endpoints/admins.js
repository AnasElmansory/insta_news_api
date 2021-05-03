const router = require("express").Router();
const Admin = require("../models/admin");
const { authorizeUser } = require("../authentication/auth");

router.get("/api/admin/:id", authorizeUser, async (req, res) => {
  const { userId, error, id } = req.params;
  if (!userId || error)
    return res.send(`UnAuthorized error: ${error || "something went wrong"}`);
  const admin = await Admin.find({ id });
  res.send(admin);
});

router.get("/api/is-admin/:id", authorizeUser, async (req, res) => {
  const { userId, error, id } = req.params;
  if (!id) return res.status(400).send("no news id specified");
  if (!userId || error)
    return res
      .status(401)
      .send(`UnAuthorized error: ${error || "something went wrong"}`);
  const isAdmin = await Admin.exists({ id });
  res.send(isAdmin);
});

module.exports = router;
