const router = require("express").Router();
const User = require("../models/user");
const { userSchema } = require("../utils/schemas");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const { errorHandler } = require("../utils/helper");
const permissions = ["user", "editor", "owner"];

router.get(
  "/control/users",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const users = await User.find().limit(pageSize).skip(skip);
    res.send(users);
  }
);

router.put(
  "/control/users/grant_admin_permission/:id",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  updateUserErrorHandler,
  async (req, res) => {
    const { id } = req.params;
    const { permission } = req.body;
    const user = await User.findOneAndUpdate(
      { id: id },
      { permission: permission },
      { new: true }
    );

    res.send(user);
  }
);

router.delete(
  "/control/users/:id",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  updateUserErrorHandler,
  async (req, res) => {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ id });
    res.send(user);
  }
);

router.get(
  "/control/users/search",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { query } = req.query;
    const users = await User.find({ name: { $regex: query, $options: "i" } });
    res.send(users);
  }
);
router.post("/api/users", authorizeUser, errorHandler, async (req, res) => {
  const { value } = userSchema.validate(req.body);
  const exists = await User.exists({ id: value.id });
  if (exists) return res.status(409).send("user already exists");
  const user = await User.create(value);
  res.send(user);
});

async function updateUserErrorHandler(req, res, next) {
  const { id } = req.params;
  const editedUser = await User.findOne({ id });
  if (!editedUser) {
    return res.status(404).send("unexpected error user not found!");
  } else if (editedUser.permission === permissions[2]) {
    return res
      .status(403)
      .send("you can't edit or delete this user (admin user)");
  } else {
    next();
  }
}

module.exports = router;
