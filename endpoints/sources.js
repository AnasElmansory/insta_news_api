const router = require("express").Router();
const Source = require("../models/source");
const Country = require("../models/country");
const { sourceSchema } = require("../utils/schemas");
const { authorizeAdmin, authorizeUser } = require("../authentication/auth");
const { getSource } = require("../utils/twitter_api");
const { errorHandler } = require("../utils/helper");

router.get(
  "/control/sources",
  authorizeUser,
  errorHandler,
  async (req, res) => {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const sources = await Source.find().limit(pageSize).skip(skip);
    res.send(sources);
  }
);
router.get(
  "/control/sources/search/:source",
  authorizeUser,
  errorHandler,
  async (req, res) => {
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
  async (req, res) => {
    const { follows } = req.query;
    let sourcesId = [];
    if (follows !== "" && follows !== undefined) sourcesId = follows.split(",");
    const sources = await Source.find({ id: { $in: sourcesId } }).sort({
      created_at: "descending",
    });
    res.send(sources);
  }
);

router.get(
  "/control/sources/search/twitter/:username",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { username } = req.params;
    const decodedUsername = decodeURI(username);
    const arabic = /[\u0600-\u06FF]/;
    const isArabic = arabic.test(decodedUsername);
    if (isArabic)
      return res.status(400).send("cannot search with arabic characters!");
    const { data, includes, error } = await getSource({ username });
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
  async (req, res) => {
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
  async (req, res) => {
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
  async (req, res) => {
    const { query, follows } = req.query;
    let sourcesId = [];
    if (follows !== "" && follows !== undefined) sourcesId = follows.split(",");
    const decodedQuery = decodeURI(query);
    const sources = await Source.find({
      id: { $in: sourcesId },
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
  async (req, res) => {
    const { error, value } = sourceSchema.validate(req.body);
    if (error) return res.status(400).send(error);
    const exists = await Source.exists({ id: value.id });
    if (exists) return res.status(409).send("source already exists!");
    const source = await Source.create(value);
    res.send(source);
  }
);

router.delete(
  "/control/sources/:id",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req, res) => {
    const { id } = req.params;
    const source = await Source.findOneAndDelete({ id });
    res.send(source);
  }
);

module.exports = router;
