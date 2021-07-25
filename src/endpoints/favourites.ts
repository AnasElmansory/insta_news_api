import express from "express";
import Favourite from "../models/favourite";
import News from "../models/news";
import { authorizeUser } from "../authentication/auth";
import errorHandler from "../utils/helper";

const router = express.Router();
router.get(
  "/api/favourite",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { userId } = req.params;
    const fav = await Favourite.findOne({ userId });
    let news = [];
    if (fav) {
      const { favNewsIds } = fav;
      news = await News.find({ id: { $in: favNewsIds } });
    }
    res.send(news);
  }
);

router.get(
  "/api/favourite/search",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
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
  async (req: any, res: any) => {
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

export default router;
