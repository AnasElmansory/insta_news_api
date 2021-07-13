const router = require("express").Router();
const Admin = require("../models/admin");
const { authorizeUser } = require("../authentication/auth");
const { errorHandler } = require("../utils/helper");

router.get("/api/admins/:id", authorizeUser, errorHandler, async (req, res) => {
  const { id } = req.params;
  const admin = await Admin.findOne({ id });
  res.send(admin);
});

router.get(
  "/api/is/admin/:id",
  authorizeUser,
  errorHandler,
  async (req, res) => {
    const { id } = req.params;
    const isAdmin = await Admin.exists({ id });
    res.send(isAdmin);
  }
);

module.exports = router;
