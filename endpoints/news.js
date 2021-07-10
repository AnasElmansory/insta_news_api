const router = require("express").Router();
const News = require("../models/news");
const Source = require("../models/source");
const { authorizeUser } = require("../authentication/auth");
const { sourceSchema } = require("../utils/schemas");

router.get("/api/news", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  let { page, pageSize } = req.query;
  let news = [];
  if (!page) page = 1;
  if (!pageSize) pageSize = 10;
  const skip = (page - 1) * pageSize;
  const sources = await Source.find().limit(pageSize).skip(skip);

  for (const source of sources) {
    const oneNews = await News.findOne({ author_id: source.id }).sort({
      created_at: "descending",
    });
    news.push(oneNews);
  }
  res.send(news);
});

router.get("/api/follow/news", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  const { follows } = req.query;
  const sources = follows.split(",");
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  let news = [];
  for (const source of sources) {
    const oneNews = await News.findOne({ author_id: source }).sort({
      created_at: "descending",
    });
    news.push(oneNews);
  }
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
  const { id, username, name } = source;
  const news = await News.find({
    $or: [
      { author_id: id },
      { "users.username": username },
      { "users.name": name },
    ],
  })
    .sort({ created_at: "descending" })
    .limit(pageSize)
    .skip(skip);
  res.send(news);
});

router.get("/api/search/news", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  const { source, query } = req.query;
  const decodedQuery = decodeURI(query);
  const { value } = sourceSchema.validate(source);

  const sourceFilters = {
    $and: [
      { author_id: value.id },
      { "users.username": value.username },
      { "users.name": value.name },
      { text: { $regex: decodedQuery, $options: "i" } },
    ],
  };
  const generalFilters = {
    $or: [
      { author_id: value.id },
      { "users.username": value.username },
      { "users.name": value.name },
      { text: { $regex: value, $options: "i" } },
    ],
  };
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);

  const news = await News.find(source ? sourceFilters : generalFilters).sort({
    created_at: "descending",
  });
  res.send(news);
});

module.exports = router;
