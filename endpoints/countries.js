const router = require("express").Router();
const Country = require("../models/country");
const { countrySchema } = require("../utils/schemas");
const { authorizeUser, authorizeAdmin } = require("../authentication/auth");
//* country and source id
//* add contries object to news
//* create collections of countries

/*
news {
      id: newsId,
      contries: [CountryObject(countryname, countrycode), ...],
      ...,
      ...
 }
*/
router.get(
  "/api/control/countries",
  authorizeUser,
  authorizeAdmin,
  async (req, res) => {
    const { isAdmin, userId, error } = req.params;
    if (!userId || error)
      return res
        .status(403)
        .send(`UnAuthorized : ${error || "something went wrong"}`);
    if (!isAdmin) res.status(403).send("require admin permission");

    let { page, pageSize } = req.query;
    if (!page) page = 1;
    if (!pageSize) pageSize = 10;
    const skip = (page - 1) * pageSize;

    const countries = await Country.find().limits(pageSize).skip(skip);
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
      { countryCode: value.countryCode, countryName: value.countryName },
      {},
      { new: true }
    );
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
    const exists = await Country.exists(country);
    if (!exists)
      return res
        .status(404)
        .send(`this country {${country.countryName}} doesn't exists`);

    const _country = await Country.findOneAndDelete(country);
    res.send(_country);
  }
);

module.exports = router;
