import mongo from "mongoose";
const Schema = mongo.Schema;

const countrySourceSchema = new Schema({
  id: String,
  name: String,
});

const countrySchema = new Schema({
  countryCode: String,
  countryName: String,
  countryNameAr: String,
  sources: [countrySourceSchema],
});

const Country = mongo.model("country", countrySchema, "countries");

export default Country;
