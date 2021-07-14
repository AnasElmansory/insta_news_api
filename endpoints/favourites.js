const router = require("express").Router();
const Favourite = require("../models/favourite");
const News = require("../models/news");
const { authorizeUser } = require("../authentication/auth");
const { errorHandler } = require("../utils/helper");

router.get("/api/favourite", authorizeUser, errorHandler, async (req, res) => {
  const { userId } = req.params;
  const fav = await Favourite.findOne({ userId });
  let news = [];
  if (fav) {
    const { favNewsIds } = fav;
    news = await News.find({ id: { $in: favNewsIds } });
  }
  res.send(news);
});

router.get(
  "/api/favourite/search",
  authorizeUser,
  errorHandler,
  async (req, res) => {
    const { userId } = req.params;
    const { query } = req.query;
    const decodedQuery = decodeURI(query);
    const fav = await Favourite.findOne({ userId });
    let news = [];
    if (fav) {
      const { favNewsIds } = fav;
      news = await News.find({
        id: { $in: favNewsIds },
        text: { $regex: decodedQuery, $options: "i" },
      });
    }
    res.send(news);
  }
);

router.post(
  "/api/favourite/news",
  authorizeUser,
  errorHandler,
  async (req, res) => {
    const { userId } = req.params;
    const { newsId } = req.body;
    const userFavExists = await Favourite.exists({ userId });
    const exists = await Favourite.exists({
      $and: [{ userId }, { favNewsIds: newsId }],
    });
    if (!userFavExists) {
      await Favourite.create({
        userId,
        favNewsIds: [newsId],
      });
      const news = await News.findOne({ id: newsId });
      return res.send(news);
    } else if (!exists) {
      await Favourite.findOneAndUpdate(
        { userId },
        { $push: { favNewsIds: newsId } },
        { new: true }
      );
    } else if (exists) {
      await Favourite.findOneAndUpdate(
        { userId },
        { $pull: { favNewsIds: newsId } },
        { new: true }
      );
    }
    const news = await News.findOne({ id: newsId });
    return res.send(news);
  }
);

module.exports = router;
