const { getSourceTweets } = require("./twitter_api");
const News = require("../models/news");
const Source = require("../models/source");
const Notification = require("../models/notification_topic");
const sendNotification = require("../notifications/notification_manager");
const { bearerToken } = require("../config");
const axios = require("axios").default;
let id = undefined;

async function feedingNews(max_result) {
  const sources = await Source.find();
  sources.forEach(async (source) => {
    const { tweets, error, media, users, referencedTweets } =
      await getSourceTweets(source.id, max_result);
    if (error) console.error(error);

    for (const tweet of tweets) {
      handleNotification(source.id, source.username, tweet.text);
      let publishedTweet = { ...tweet };
      const { attachments } = tweet;
      if (attachments && media) {
        const { media_keys } = attachments;
        let tweetMedia = [];
        for (const item of media) {
          if (media_keys.includes(item.media_key)) {
            if (item.type === "video") {
              const { error, data } = await getVideoDetails(publishedTweet.id);
              if (data && !error) {
                const { url } = data;
                let modifiedItem = ({ ...item }.url = url);
                tweetMedia.push(modifiedItem);
              }
            } else {
              tweetMedia.push(item);
            }
          }
        }
      }
      publishedTweet.media = tweetMedia;
      if (referencedTweets) {
        let referenced_tweet_objects = [];
        for (const reference of tweet.referenced_tweets) {
          const oneRefTweet = referencedTweets.find(
            (t) => t.id === reference.id
          );
          referenced_tweet_objects.push(oneRefTweet);
        }
        publishedTweet.referenced_tweet_objects = referenced_tweet_objects;
      }
      if (users) publishedTweet.users = users;
      const exists = await News.exists({ id: tweet.id });
      if (!exists) await News.create(publishedTweet);
    }
  });
}

async function handleNotification(sourceId, sourceName, text) {
  const notification_topic = await Notification.findOne({ topic: sourceId });
  for (let keyword of notification_topic.keywords) {
    if (text.includes(keyword)) {
      await sendNotification(sourceId, {
        title: sourceName,
        body: text,
      });
    }
  }
}

async function startTwitFeed(max_result) {
  id = setInterval(feedingNews, 500000, max_result);
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

async function getVideoDetails(id, mediaKey) {
  let response = {};
  const result = await axios.get(
    `https://api.twitter.com/1.1/statuses/show.json?id=${id}`,
    {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    }
  );
  const { extended_entities } = result.data;
  if (!extended_entities) {
    return (response.error = "video details not found");
  } else {
    const { media } = extended_entities;
    const singleMedia = media.find((x) => x.id_str === mediaKey);
    const {
      video_info: { variants },
    } = singleMedia;

    return (response.data = variants[0]);
  }
}
module.exports = { startTwitFeed, stopTwitFeed, checkFeedingState };
