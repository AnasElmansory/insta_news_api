import TwitterApi, {
  ApiV2Includes,
  TweetUserTimelineV2Paginator,
  TweetV2,
  UsersV2Params,
  UserV2,
} from "twitter-api-v2";
import { bearerToken } from "../config";
const twitter = new TwitterApi(bearerToken);
const client = twitter.readWrite;

interface SourceResult {
  data?: UserV2;
  error?: string;
  includes?: ApiV2Includes | undefined;
}

async function getSource(username: string) {
  const userFields: Partial<UsersV2Params> = {
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
  let result: SourceResult = {};
  if (!username) {
    result.error = "please specify source username";
    return result;
  } else if (username) {
    const _result = await client.v2.userByUsername(username, userFields);
    result.data = _result.data;
    result.error = JSON.stringify(_result.errors);
    result.includes = _result.includes;
    return result;
  } else {
    result.error = "something went wrong";
    return result;
  }
}

async function getSourceTweets(userId: string, maxResult = 10) {
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
      "referenced_tweets.id",
    ],
    "user.fields": ["location", "profile_image_url"],
    max_results: maxResult,
  });
  // result.tweets = _result.tweets;
  // result.error = _result.data.errors;
  // result.meta = _result.data.meta;
  // if (_result.data.includes) {
  //   result.media = _result.data.includes.media;
  //   result.places = _result.data.includes.places;
  //   result.users = _result.data.includes.users;
  //   result.referencedTweets = _result.data.includes.tweets;
  // }
  return _result;
}

export { getSource, getSourceTweets, client };
