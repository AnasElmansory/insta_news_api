const router = require("express").Router();
const User = require("../models/user");
const { userSchema } = require("../utils/schemas");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");

router.get(
  "/api/control/users",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { userId, error, isAdmin } = req.params;
    if (error || !userId) return res.status(403).send(error);
    if (!isAdmin) return res.status(401).send("have no permission");
    let { page, pageSize } = req.query;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    const skip = (page - 1) * pageSize;
    const users = await User.find().limit(pageSize).skip(skip);
    res.send(users);
  }
);

router.get(
  "/api/control/users/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(409).send("have no permission");
    const { id } = req.params;
    if (!id) return res.status(400).send("specify id for particular user");
    const user = await User.find(id);
    res.send(user);
  }
);

router.post("/api/users", authorizeUser, async (req, res) => {
  const { value } = userSchema.validate(req.body);
  const exists = await User.exists({ id: value.id });
  if (exists) return res.status(409).send("user already exists");
  const _user = await User.create(value);
  res.send(_user);
});

router.put(
  "/api/users/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { userId, id } = req.params;
    const { user } = req.body;
    if (!id || !user) return res.status(400).send("bad request");
    if (id !== userId)
      return res.status(401).send("you don't have permission to update user");
    const _user = await User.findOneAndUpdate(
      { id: user.id },
      { name: user.name, avatar: user.avatar },
      { new: true }
    );
    res.send(_user);
  }
);

router.delete(
  "/api/control/users/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(409).send("have no permission");
    const { id } = req.params;
    if (!id) return res.status(400).send("bad request");
    const user = await User.findOneAndDelete({ id: user.id });
    res.send(user);
  }
);

router.get(
  "/api/control/search/users/:username",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { userId, error, isAdmin, username } = req.params;
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized  ${error || "something went wrong"}`);
    if (!isAdmin) return res.status(401).send("have no permission");
    const users = await User.find({
      $or: [{ name: { $regex: username, $options: "i" } }],
    });
    res.send(users);
  }
);

module.exports = router;
