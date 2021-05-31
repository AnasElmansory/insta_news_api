const mongo = require("mongoose");
const Schema = mongo.Schema;

const favouriteSchema = new Schema({
  userId: String,
  favNewsIds: [{ type: String }],
});

const Favourite = mongo.model("favourite", favouriteSchema, "favourites");
module.exports = Favourite;
