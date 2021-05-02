const mongo = require("mongoose");
const Schema = mongo.Schema;

const newsSchema = new Schema({
  id: String,
  text: String,
  lang: String,
  source: String,
  location: String,
  author_id: String,
  created_at: String,
  attachments: Object,
  public_metrics: Object,
  media: Array,
});

const News = mongo.model("news", newsSchema, "news");
module.exports = News;
