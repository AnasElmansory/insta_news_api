const mongo = require("mongoose");
const Schema = mongo.Schema;

const userSchema = new Schema({
  id: String,
  name: String,
  email: String,
  avatar: String,
  provider: String,
});

const User = mongo.model("user", userSchema, "users");
module.exports = User;
