const router = require("express").Router();
const User = require("../models/user");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");

router.get(
  "/api/users",
  authorizeUser,
  authorizeAdmin,
  async (req, res, next) => {
    const { userId, error } = req.params;
    const { isAdmin } = req.params;
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
  "/api/users/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res, next) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(409).send("have no permission");
    const { id } = req.params;
    if (!id) return res.status(400).send("specify id for particular user");
    const user = await User.find(id);
    res.send(user);
  }
);

router.post(
  "/api/users",
  authorizeUser,
  authorizeAdmin,
  async (req, res, next) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(409).send("have no permission");
    const { user } = req.body;
    const exists = await User.exists({ id: user.id });
    if (exists) return res.status(409).send("user already exists");
    const _user = await User.find();
    res.send(_user);
  }
);

router.put(
  "/api/users/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res, next) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(409).send("have no permission");
    const { id } = req.params;
    const { user } = req.body;
    if (!id || !user) return res.status(400).send("bad request");
    const _user = await User.findOneAndUpdate(
      { id: user.id },
      { name: user.name, avatar: user.avatar }
    );
    res.send(_user);
  }
);

router.delete(
  "/api/users/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res, next) => {
    const { isAdmin } = req.params;
    if (!isAdmin) return res.status(409).send("have no permission");
    const { id } = req.params;
    if (!id) return res.status(400).send("bad request");
    const user = await User.findOneAndDelete({ id: user.id });
    res.send(user);
  }
);

module.exports = router;
