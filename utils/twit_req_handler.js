const { getSourceTweets } = require("./twitter_api");
const News = require("../models/news");
const Source = require("../models/source");

let id;
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
  }, 500000);

  return id;
}

function stopTwitFeed() {
  try {
    clearInterval(id);
    id = null;
    return { id, result: "disabled" };
  } catch (err) {
    return err;
  }
}

module.exports = { startTwitFeed, stopTwitFeed, id };
