const router = require("express").Router();
const Favourite = require("../models/favourite");
const News = require("../models/news");
const { authorizeUser } = require("../authentication/auth");

router.get("/api/favourite/news", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  const fav = await Favourite.findOne({ userId });
  let news;
  if (fav) {
    const { favNewsIds } = fav;
    news = await News.find({ id: { $in: favNewsIds } });
  }
  res.send(news);
});

router.get("/api/favourite/search", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  const { query } = req.query;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  const fav = await Favourite.findOne({ userId });

  let news;
  if (fav) {
    const { favNewsIds } = fav;
    news = await News.find({
      $and: [
        { id: { $in: favNewsIds } },
        { text: { $regex: query, $options: "i" } },
      ],
    });
  }
  res.send(news);
});

router.post("/api/favourite/news", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  const { newsId } = req.body;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);
  const userFavExists = await Favourite.exists({ userId });
  const exists = await Favourite.exists({ favNewsIds: newsId });
  if (!userFavExists) {
    const fav = await Favourite.create({
      userId,
      favNewsIds: [newsId],
    });
    return res.send(fav);
  } else if (!exists) {
    const fav = await Favourite.findOneAndUpdate(
      { userId },
      { $push: { favNewsIds: newsId } },
      { new: true }
    );
  } else if (exists) {
    const fav = await Favourite.findOneAndUpdate(
      { userId },
      { $pull: { favNewsIds: newsId } },
      { new: true }
    );
  }
  const news = await News.findOne({ id: newsId });
  return res.send(news);
});

module.exports = router;
