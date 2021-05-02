const router = require("express").Router();
const News = require("../models/news");
const { authorizeUser } = require("../authentication/auth");

router.get("/api/news", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  if (!userId || error)
    return res.send(`UnAuthorized error: ${error || "something went wrong"}`);
  let { page, pageSize } = req.query;
  if (!page) page = 1;
  if (!pageSize) pageSize = 10;
  const skip = (page - 1) * pageSize;
  const news = await News.find().limit(pageSize).skip(skip);
  res.send(news);
});

router.get("/api/news/:id", authorizeUser, async (req, res) => {
  const { userId, error, id } = req.params;
  if (!id) return res.status(400).send("no news id specified");
  if (!userId || error)
    return res
      .status(401)
      .send(`UnAuthorized error: ${error || "something went wrong"}`);
  const news = await News.findOne({ id });
  res.send(news);
});

module.exports = router;
