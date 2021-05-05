const { getSourceTweets } = require("./twitter_api");
const News = require("../models/news");
const Source = require("../models/source");

let id = undefined;
async function startTwitFeed(max_result) {
  id = setInterval(async () => {
    const sources = await Source.find();
    sources.forEach(async (source) => {
      const { tweets, error, media, meta, users } = await getSourceTweets(
        source.id,
        max_result
      );
      if (!error) {
        tweets.forEach(async (tweet) => {
          let publishedTweet = { ...tweet };
          const { attachments } = tweet;
          if (attachments && media) {
            const { media_keys } = attachments;
            const tweetMedia = media.filter((m) =>
              media_keys.includes(m.media_key)
            );
            publishedTweet.media = tweetMedia;
          }
          if (users) publishedTweet.users = users;
          const exists = await News.exists({ id: tweet.id });
          if (exists) await News.findOneAndUpdate(publishedTweet);
          if (!exists) await News.create(publishedTweet);
        });
      } else console.error(error);
    });
  }, 5000);

  return id;
}

function stopTwitFeed() {
  try {
    clearInterval(id);
    id = undefined;
    return { id, result: "disabled" };
  } catch (err) {
    return err;
  }
}

function checkFeedingState() {
  if (id === undefined || !id) return false;
  else return true;
}
module.exports = { startTwitFeed, stopTwitFeed, checkFeedingState };
