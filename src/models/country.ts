import mongo from "mongoose";
const Schema = mongo.Schema;

const countrySchema = new Schema({
  countryCode: String,
  countryName: String,
  countryNameAr: String,
  sources: [String],
});

const Country = mongo.model("country", countrySchema, "countries");

export default Country;
