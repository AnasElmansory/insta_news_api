const router = require("express").Router();
const News = require("../models/news");
const { authorizeUser } = require("../authentication/auth");
const { sourceSchema } = require("../utils/schemas");

router.get("/api/news", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  let { page, pageSize } = req.query;
  if (!page) page = 1;
  if (!pageSize) pageSize = 10;
  const skip = (page - 1) * pageSize;
  const news = await News.find()
    .sort({ created_at: "descending" })
    .limit(pageSize)
    .skip(skip);
  res.send(news);
});

router.get("/api/news/:id", authorizeUser, async (req, res) => {
  const { userId, error, id } = req.params;
  if (!id) return res.status(400).send("no news id specified");
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  const news = await News.findOne({ id });
  res.send(news);
});

router.get("/api/news/by/source", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  let { page, pageSize, source } = req.query;
  if (!page) page = 1;
  if (!pageSize) pageSize = 10;
  const skip = (page - 1) * pageSize;

  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  if (!source) return res.status(400).send("no news source specified");
  const { error: validationError, value } = sourceSchema.validate(source);
  if (validationError) return res.status(400).send(validationError);
  const news = await News.find({
    $or: [
      { author_id: value.id },
      { "users.username": value.username },
      { "users.name": value.name },
    ],
  })
    .sort({ created_at: "descending" })
    .limit(pageSize)
    .skip(skip);
  res.send(news);
});

router.get("/api/news/search", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  const { source, query } = req.query;
  const filters = [];
  filters.push({ text: { $regex: query, $options: "i" } });
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  if (source) {
    const { value } = sourceSchema.validate(source);
    filters.push([
      { author_id: value.id },
      { "users.username": value.username },
      { "users.name": value.name },
    ]);
  }
  const news = await News.find({ $and: filters })
    .sort({ created_at: "descending" })
    .limit(pageSize)
    .skip(skip);
  res.send(news);
});

module.exports = router;
