const mongo = require("mongoose");
const Schema = mongo.Schema;

const adminSchema = new Schema({
  id: String,
  name: String,
  email: String,
  avatar: String,
  provider: String,
  permissions: String,
});

const Admin = mongo.model("admin", adminSchema, "admins");
module.exports = Admin;
