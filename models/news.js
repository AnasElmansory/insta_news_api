const mongo = require("mongoose");
const Schema = mongo.Schema;

const referencedTweetSchema = new Schema({
  id: String,
  type: String,
});

const publicMetricSchema = new Schema({
  view_count: Number,
  retweet_count: Number,
  reply_count: Number,
  like_count: Number,
  quote_count: Number,
});

const mediaSchema = new Schema({
  url: String,
  media_key: String,
  type: String,
  height: Number,
  preview_image_url: String,
  width: Number,
  duration_ms: Number,
  public_metrics: publicMetricSchema,
});

const hashtagSchema = new Schema({
  start: Number,
  end: Number,
  tag: String,
});

const urlsSchema = new Schema({
  start: Number,
  end: Number,
  url: String,
  expanded_url: String,
  display_url: String,
});

const mentionSchema = new Schema({
  start: Number,
  end: Number,
  username: String,
});

const entitySchema = new Schema({
  hashtags: [hashtagSchema],
  urls: [urlsSchema],
  mentions: [mentionSchema],
});

const attachmentSchema = new Schema({
  media_keys: [String],
});

const twitterUserSchema = new Schema({
  id: String,
  name: String,
  username: String,
});
const newsSchema = new Schema({
  id: String,
  text: String,
  lang: String,
  source: String,
  location: String,
  author_id: String,
  created_at: String,
  entities: entitySchema,
  users: [twitterUserSchema],
  attachments: attachmentSchema,
  public_metrics: publicMetricSchema,
  media: [mediaSchema],
  referenced_tweets: [referencedTweetSchema],
  referenced_tweet_objects: [newsSchema],
});

const News = mongo.model("news", newsSchema, "news");
module.exports = News;
