import mongo from "mongoose";
const Schema = mongo.Schema;

const sourceSchema = new Schema({
  id: String,
  username: String,
  name: String,
  profile_image_url: String,
  url: String,
  location: String,
  description: String,
  created_at: String,
  verified: Boolean,
});

const Source = mongo.model("source", sourceSchema, "sources");
export default Source;
