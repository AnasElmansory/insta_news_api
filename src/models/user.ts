import mongo from "mongoose";
const Schema = mongo.Schema;

const userSchema = new Schema({
  id: String,
  name: String,
  email: String,
  avatar: String,
  provider: String,
  permission: String,
});

const User = mongo.model("user", userSchema, "users");
export default User;
