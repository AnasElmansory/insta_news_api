const router = require("express").Router();
const Source = require("../models/source");
const { sourceSchema } = require("../utils/schemas");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const { getSource } = require("../utils/twitter_api");

router.get("/api/sources", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized error: ${error || "something went wrong"}`);
  let { page, pageSize } = req.query;
  if (!page) page = 1;
  if (!pageSize) pageSize = 10;
  const skip = (page - 1) * pageSize;
  const sources = await Source.find().limit(pageSize).skip(skip);
  res.send(sources);
});

router.get("/api/sources/byId/:id", authorizeUser, async (req, res) => {
  const { userId, error, id } = req.params;
  if (!id) return res.status(400).send("no source id specified");
  if (!userId || error)
    return res
      .status(401)
      .send(`UnAuthorized error: ${error || "something went wrong"}`);
  const source = await Source.findOne({ id });
  res.send(source);
});
router.get(
  "/api/sources/by/username/:username",
  authorizeUser,
  async (req, res) => {
    const { userId, error, username } = req.params;
    const query = username;
    if (!username) return res.status(400).send("no source username specified");
    if (!userId || error)
      return res
        .status(401)
        .send(`UnAuthorized error: ${error || "something went wrong"}`);
    const sources = await Source.find({
      $or: [
        { username: { $regex: username, $options: "i" } },
        { name: { $regex: username, $options: "i" } },
      ],
    });
    res.send(sources);
  }
);

router.get(
  "/api/control/sources/byId/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { userId, isAdmin, id } = req.params;
    if (req.params.error)
      return res.status(401).send(`UnAuthorized error: ${error}`);
    if (!isAdmin) return res.status(401).send("admin permission required!");
    if (!userId)
      return res.status(401).send("UnAuthorized error: something went wrong!");
    const { data, includes, error } = await getSource({ id });
    if (error) return res.status(500).json({ error });
    res.send({
      data,
      includes,
    });
  }
);
router.get(
  "/api/control/sources/by/username/:username",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { userId, isAdmin, username, error: authError } = req.params;
    if (authError) return res.status(401).send(`UnAuthorized  ${authError}`);
    if (!isAdmin) return res.status(401).send("admin permission required!");
    if (!userId)
      return res.status(401).send("UnAuthorized error: something went wrong!");
    const { data, includes, error } = await getSource({ username });
    if (error) return res.status(500).json(error);
    res.send({
      data,
      includes,
    });
  }
);

router.post(
  "/api/control/sources",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { userId, isAdmin } = req.params;
    if (req.params.error)
      return res.status(401).send(`UnAuthorized error: ${error}`);
    const { error, value } = sourceSchema.validate(req.body);
    if (!isAdmin) return res.status(401).send("admin permission required!");
    if (error) return res.status(400).send(error);
    if (!userId)
      return res.status(401).send("UnAuthorized error: something went wrong!");
    const exists = await Source.exists({ id: value.id });
    if (exists) return res.status(409).send("source already exists!");
    const source = await Source.create(value);
    res.send(source);
  }
);

router.delete(
  "/api/control/sources/:id",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { userId, isAdmin, id, error } = req.params;
    if (error) return res.status(401).send(`UnAuthorized error: ${error}`);
    if (!userId)
      return res.status(401).send("UnAuthorized error: something went wrong!");
    if (!isAdmin) return res.status(401).send("admin permission required!");
    const source = await Source.findOneAndDelete({ id });
    res.send(source);
  }
);

module.exports = router;
