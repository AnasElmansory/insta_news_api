import express from "express";
import News from "../models/news";
import SourceFollow from "../models/follow_source";
import { authorizeUser, authorizeAdmin } from "../authentication/auth";
import errorHandler from "../utils/helper";

const router = express.Router();
router.get(
  "/control/news",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const news = await News.find().skip(skip).limit(pageSize).sort({
      created_at: "descending",
    });

    res.send(news);
  }
);
router.get(
  "/control/news/search",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { page = 1, pageSize = 10, query } = req.query;
    const decodedQuery = decodeURI(query);
    const skip = (page - 1) * pageSize;
    const news = await News.find({
      text: { $regex: decodedQuery, $options: "i" },
    })
      .skip(skip)
      .limit(pageSize)
      .sort({
        created_at: "descending",
      });
    res.send(news);
  }
);

router.get(
  "/api/news/follow",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { userId } = req.params;
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const followingSources = await SourceFollow.findOne({ userId });
    if (!followingSources) {
      return res.send([]);
    }
    const { follows } = followingSources;
    const paginatedFollows = follows.slice(
      skip === 0 ? skip : skip + 1,
      skip + pageSize + 1
    );
    let news = [];
    for (const source of paginatedFollows) {
      const singleNews = await News.findOne({ author_id: source }).sort({
        created_at: "descending",
      });
      if (singleNews !== null) news.push(singleNews);
    }
    res.send(news);
  }
);

router.get(
  "/api/news/by/source",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { page = 1, pageSize = 10, sourceId } = req.query;
    const skip = (page - 1) * pageSize;
    const news = await News.find({ author_id: sourceId })
      .sort({ created_at: "descending" })
      .limit(pageSize)
      .skip(skip);
    res.send(news);
  }
);

router.get(
  "/api/news/search/by/source",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { sourceId, query } = req.query;
    const decodedQuery = decodeURI(query);
    const sourceFilters = {
      $and: [
        { author_id: sourceId },
        { text: { $regex: decodedQuery, $options: "i" } },
      ],
    };
    const news = await News.find(sourceFilters).sort({
      created_at: "descending",
    });
    res.send(news);
  }
);
router.get(
  "/api/news/search/by/follow",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { userId } = req.params;
    const { query } = req.query;
    const decodedQuery = decodeURI(query);
    const followingSources = await SourceFollow.findOne({ userId });
    if (!followingSources) {
      return res.send([]);
    }
    const { follows } = followingSources;

    const news = await News.find({
      author_id: { $in: follows },
      text: { $regex: decodedQuery, $options: "i" },
    }).sort({
      created_at: "descending",
    });
    res.send(news);
  }
);
export default router;
