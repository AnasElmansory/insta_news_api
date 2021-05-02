const mongo = require("mongoose");
const Schema = mongo.Schema;

const favouriteSchema = new Schema({
  userId: String,
  favNewsIds: Array,
});

const Favourite = mongo.model("favourite", favouriteSchema, "favourites");
module.exports = Favourite;
