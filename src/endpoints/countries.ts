import express from "express";
import Country from "../models/country";
import { authorizeUser, authorizeAdmin } from "../authentication/auth";
import errorHandler from "../utils/helper";
import { countrySchema } from "../utils/schemas";

interface CountrySource {
  id: string;
  name: string;
}

const router = express.Router();
router.get(
  "/control/countries",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;
    const countries = await Country.find().limit(pageSize).skip(skip);
    res.send(countries);
  }
);
router.get(
  "/control/countries/search/:country",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { country } = req.params;
    const decodedQuery = decodeURI(country);
    const countries = await Country.find({
      $or: [
        { countryName: { $regex: country, $options: "i" } },
        { countryNameAr: { $regex: decodedQuery, $options: "i" } },
      ],
    });
    res.send(countries);
  }
);

router.post(
  "/control/countries",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { error, value } = countrySchema.validate(req.body);
    if (error) return res.status(400).send(error);
    const exists = await Country.exists({
      countryCode: value.countryCode,
      countryName: value.countryName,
      countryNameAr: value.countryNameAr,
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
  "/control/countries",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { error, value } = countrySchema.validate(req.body);
    if (error) return res.status(400).send(error);
    const exists = await Country.exists({
      $or: [
        { countryCode: value.countryCode },
        { countryName: value.countryName },
        { countryNameAr: value.countryNameAr },
      ],
    });
    if (!exists)
      return res
        .status(404)
        .send(`this country {${value.countryName}} doesn't exists`);

    const countrySources = new Set<CountrySource>(value.sources);

    const country = await Country.findOneAndUpdate(
      { countryName: value.countryName, countryNameAr: value.countryNameAr },
      {
        countryName: value.countryName,
        countryNameAr: value.countryNameAr,
        sources: [...countrySources],
      },
      { new: true }
    );
    res.send(country);
  }
);

router.delete(
  "/control/countries/:country",
  authorizeUser,
  authorizeAdmin,
  async (req: any, res: any) => {
    const { country } = req.params;
    const exists = await Country.exists({ countryName: country });
    if (!exists)
      return res.status(404).send(`this country {${country}} doesn't exists`);
    const _country = await Country.findOneAndDelete({ country });
    res.send(_country);
  }
);

export default router;
