const router = require("express").Router();
const Country = require("../models/country");
const { countrySchema } = require("../utils/schemas");
const { authorizeUser, authorizeAdmin } = require("../authentication/auth");

router.get("/api/control/countries", authorizeUser, async (req, res) => {
  const { userId, error } = req.params;
  if (!userId || error)
    return res
      .status(403)
      .send(`UnAuthorized : ${error || "something went wrong"}`);

  let { page, pageSize } = req.query;
  if (!page) page = 1;
  if (!pageSize) pageSize = 10;
  const skip = (page - 1) * pageSize;

  const countries = await Country.find().limit(pageSize).skip(skip);
  res.send(countries);
});
router.get(
  "/api/control/search-countries/:country",
  authorizeUser,
  async (req, res) => {
    const { userId, error, country } = req.params;
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized : ${error || "something went wrong"}`);
    if (!country)
      return res.status(400).send("please specify country parameter");

    const countries = await Country.find({
      countryName: { $regex: country, $options: "i" },
    });
    res.send(countries);
  }
);

router.post(
  "/api/control/countries",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin, userId, error } = req.params;
    const { error: validationError, value } = countrySchema.validate(req.body);
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized : ${error || "something went wrong"}`);
    if (!isAdmin) res.status(403).send("require admin permission");
    if (validationError) return res.status(400).send(validationError);
    const exists = await Country.exists({
      countryCode: value.countryCode,
      countryName: value.countryName,
    });
    if (exists)
      return res
        .status(409)
        .send(`this country {${value.countryName}} already exists`);

    const country = await Country.create(value);
    res.send(country);
  }
);
router.put(
  "/api/control/countries",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin, userId, error } = req.params;
    const { error: validationError, value } = countrySchema.validate(req.body);
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized : ${error || "something went wrong"}`);
    if (!isAdmin) res.status(403).send("require admin permission");
    if (validationError) return res.status(400).send(validationError);
    const exists = await Country.exists({
      countryCode: value.countryCode,
      countryName: value.countryName,
    });
    if (!exists)
      return res
        .status(404)
        .send(`this country {${value.countryName}} doesn't exists`);

    const country = await Country.findOneAndUpdate(
      {
        countryCode: value.countryCode,
        countryName: value.countryName,
        sources: value.sources,
      },
      {},
      { new: true }
    );
    console.log(country);
    res.send(country);
  }
);

router.delete(
  "/api/control/countries/:countryName",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin, userId, error, countryName } = req.params;
    const { countryCode } = req.query;
    const country = { countryName, countryCode };
    if (!countryName)
      return res
        .status(400)
        .send(
          "please specify which country you want to delete;  missing country name parameter"
        );
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized : ${error || "something went wrong"}`);
    if (!isAdmin) res.status(403).send("require admin permission");
    const exists = await Country.exists({ countryName });
    if (!exists)
      return res
        .status(404)
        .send(`this country {${country.countryName}} doesn't exists`);

    const _country = await Country.findOneAndDelete({ countryName });
    res.send(_country);
  }
);

module.exports = router;
