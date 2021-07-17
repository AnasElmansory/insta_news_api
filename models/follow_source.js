const mongo = require("mongoose");
const Schema = mongo.Schema;

const followSourceSchema = new Schema({
  userId: String,
  follows: [String],
});

const FollowSource = mongo.model(
  "followSource",
  followSourceSchema,
  "followSources"
);
module.exports = FollowSource;
