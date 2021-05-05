const TwitterApi = require("twitter-api-v2").default;
const { bearerToken } = require("../config");
const twitter = new TwitterApi(bearerToken);
const client = twitter.readWrite;

async function getSource({ id, username }) {
  const userFields = {
    "user.fields": [
      "created_at",
      "description",
      "id",
      "location",
      "name",
      "profile_image_url",
      "url",
      "username",
      "verified",
    ],
  };
  let result = {};
  if (!id && !username) {
    result.error = "no id or username are specified";
    return result;
  } else if (id) {
    const _result = await client.v2.user(id, userFields);
    result.data = _result.data;
    result.error = _result.errors;
    result.includes = _result.includes;
    return result;
  } else if (useranme) {
    const _result = await client.v2.userByUsername(username, userFields);
    result.data = _result.data;
    result.error = _result.errors;
    result.includes = _result.includes;
    return result;
  } else {
    result.error = "something went wrong";
    return result;
  }
}

async function getSourceTweets(userId, maxResult) {
  let result = {};
  if (!userId) {
    result.error = "no userId specified";
    return result;
  }
  const _result = await client.v2.userTimeline(userId, {
    "place.fields": [
      "contained_within",
      "country",
      "full_name",
      "geo",
      "id",
      "place_type",
      "name",
    ],
    "tweet.fields": [
      "attachments",
      "author_id",
      "context_annotations",
      "created_at",
      "geo",
      "id",
      "text",
      "withheld",
      "entities",
      "source",
      "public_metrics",
      "lang",
      "possibly_sensitive",
    ],
    "media.fields": [
      "duration_ms",
      "height",
      "media_key",
      "preview_image_url",
      "public_metrics",
      "type",
      "url",
      "width",
    ],
    expansions: [
      "geo.place_id",
      "attachments.media_keys",
      "referenced_tweets.id.author_id",
      "entities.mentions.username",
      "author_id",
    ],
    "user.fields": ["location", "profile_image_url"],
    max_results: maxResult,
  });
  result.tweets = _result.tweets;
  result.error = _result.data.errors;
  result.meta = _result.data.meta;
  if (_result.data.includes) {
    result.media = _result.data.includes.media;
    result.places = _result.data.includes.places;
    result.users = _result.data.includes.users;
  }
  return result;
}

module.exports = { getSource, getSourceTweets };
