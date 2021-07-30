import express from "express";
import Source from "../models/source";
import Country from "../models/country";
import SourceFollow from "../models/follow_source";
import { sourceSchema } from "../utils/schemas";
import { authorizeAdmin, authorizeUser } from "../authentication/auth";
import { getSource } from "../utils/twitter_api";
import errorHandler from "../utils/helper";

const router = express.Router();



router.get(
  "/control/sources",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const sources = await Source.find().limit(pageSize).skip(skip);
    res.send(sources);
  }
);
router.get(
  "/control/sources/search/:source",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { source } = req.params;
    const decodedSource = decodeURI(source);
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const sources = await Source.find({
      $or: [
        { username: { $regex: decodedSource, $options: "i" } },
        { name: { $regex: decodedSource, $options: "i" } },
      ],
    })
      .limit(pageSize)
      .skip(skip);
    res.send(sources);
  }
);

router.get(
  "/api/sources/follow",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { userId } = req.params;
    const { page, pageSize } = req.query;
    const skip = (page - 1) * pageSize;
    const followingSources = await SourceFollow.findOne({ userId });
    if (!followingSources) {
      return res.send([]);
    } else {
      const { follows } = followingSources;
      const sources = await Source.find({ id: { $in: follows } })
        .skip(skip)
        .limit(pageSize);
      res.send(sources);
    }
  }
);

router.get(
  "/control/sources/search/twitter/:username",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { username } = req.params;
    const decodedUsername = decodeURI(username);
    const arabic = /[\u0600-\u06FF]/;
    const isArabic = arabic.test(decodedUsername);
    if (isArabic)
      return res.status(400).send("cannot search with arabic characters!");
    const { data, includes, error } = await getSource(username);
    if (error) return res.status(500).json(error);
    res.send({
      data,
      includes,
    });
  }
);

router.get(
  "/api/sources/by/country/:country",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { country } = req.params;
    const selectedCountry = await Country.findOne({ countryName: country });
    const sources = await Source.find({ id: { $in: selectedCountry.sources } });
    res.send(sources);
  }
);

router.get(
  "/api/sources/search/by/country/:country",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { country } = req.params;
    const { query } = req.query;
    const decodedQuery = decodeURI(query);
    const selectedCountry = await Country.findOne({ countryName: country });
    const sources = await Source.find({
      id: { $in: selectedCountry.sources },
      $or: [
        { name: { $regex: decodedQuery, $options: "i" } },
        { username: { $regex: decodedQuery, $options: "i" } },
      ],
    });
    res.send(sources);
  }
);

router.get(
  "/api/sources/search/by/follow",
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
    const sources = await Source.find({
      id: { $in: follows },
      $or: [
        { name: { $regex: decodedQuery, $options: "i" } },
        { username: { $regex: decodedQuery, $options: "i" } },
      ],
    });
    res.send(sources);
  }
);

router.post(
  "/control/sources",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { error, value } = sourceSchema.validate(req.body);
    if (error) return res.status(400).send(error);
    const exists = await Source.exists({ id: value.id });
    if (exists) return res.status(409).send("source already exists!");
    const source = await Source.create(value);
    res.send(source);
  }
);
router.post(
  "/api/sources/manage/follow",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { userId } = req.params;
    const { sourceId } = req.body;
    const followingSources = await SourceFollow.findOne({ userId });
    let result: FollowResult = {
      data: undefined,
      action: "",
    };
    if (!sourceId) return res.send(result);
    if (!followingSources) {
      result.data = await SourceFollow.create({ userId, follows: [sourceId] });
      result.action = "create";
    } else {
      const { follows } = followingSources;
      if (follows.includes(sourceId)) {
        result.data = await SourceFollow.findOneAndUpdate(
          { userId },
          { $pull: { follows: sourceId } },
          { new: true }
        );
        result.action = "remove";
      } else {
        result.data = await SourceFollow.findOneAndUpdate(
          { userId },
          { $push: { follows: sourceId } },
          { new: true }
        );
        result.action = "add";
      }
    }
    res.send(result);
  }
);

router.delete(
  "/control/sources/:id",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { id } = req.params;
    const source = await Source.findOneAndDelete({ id });
    res.send(source);
  }
);

export default router;
