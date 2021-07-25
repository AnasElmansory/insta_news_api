import { getSourceTweets } from "./twitter_api";
import News from "../models/news";
import Source from "../models/source";
import Notification from "../models/notification_topic";
import sendNotification from "../notifications/notification_manager";
import { bearerToken } from "../config";
import axios from "axios";
let id: any = undefined;

interface Result {
  data?: any;
  error?: any;
}

interface TweetObject {
  id: string;
  text: string;
  lang?: string;
  created_at?: string;
  location?: string;
  source?: string;
  author_id?: string;
  entities?: any;
  users?: any;
  attachments?: any;
  media?: any;
  referenced_tweets?: any;
  referenced_tweet_objects?: any;
  public_metrics?: any;
}

async function feedingNews(max_result: number) {
  const sources = await Source.find();
  for (const source of sources) {
    const { tweets, data } = await getSourceTweets(source.id, max_result);
    console.log(tweets.length);
    if (data.errors) {
      console.error(data.errors);
      return;
    }
    const { media, tweets: refTweets, users } = data.includes || {};
    for (const tweet of tweets) {
      handleNotification(source.id, source.username, tweet.text);
      let publishedTweet: TweetObject = {
        id: tweet.id,
        text: tweet.text,
        author_id: tweet.author_id,
        source: tweet.source,
        created_at: tweet.created_at,
      };
      const { attachments } = tweet;
      if (attachments?.media_keys && media) {
        const { media_keys } = attachments;
        let tweetMedia = [];
        for (const item of media) {
          if (media_keys.includes(item.media_key)) {
            if (item.type === "video") {
              const { error, data } = await getVideoDetails(
                publishedTweet.id,
                item.media_key
              );
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
        publishedTweet.media = tweetMedia;
      }
      if (refTweets) {
        let referenced_tweet_objects = [];
        for (const reference of refTweets) {
          const oneRefTweet = refTweets.find((t) => t.id === reference.id);
          referenced_tweet_objects.push(oneRefTweet);
        }
        publishedTweet.referenced_tweet_objects = referenced_tweet_objects;
      }
      if (users) publishedTweet.users = users;
      const exists = await News.exists({ id: tweet.id });
      if (!exists) await News.create(publishedTweet);
    }
  }
}

async function handleNotification(
  sourceId: string,
  sourceName: string,
  text: string
) {
  const notification_topic = await Notification.findOne({ topic: sourceId });
  if (!notification_topic) {
    return;
  } else {
    const { keywords } = notification_topic;
    if (!keywords) {
      return;
    } else {
      for (let keyword of keywords) {
        if (text.includes(keyword)) {
          await sendNotification(sourceId, {
            notification: { title: sourceName, body: text },
          });
        }
      }
    }
  }
}

async function startTwitFeed(max_result?: number) {
  id = setInterval(feedingNews, 50000, max_result);
  return id;
}

function stopTwitFeed(): { id: any; result?: string; error?: any } {
  try {
    clearInterval(id);
    id = undefined;
    return { id, result: "disabled" };
  } catch (error) {
    return { id: error };
  }
}

function checkFeedingState() {
  if (id === undefined || !id) return false;
  else return true;
}

async function getVideoDetails(id: string, mediaKey: string) {
  let response: Result = {};
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
    const singleMedia = media.find((x: any) => x.id_str === mediaKey);
    if (!singleMedia) {
      return (response.error = "video media not found");
    } else {
      const {
        video_info: { variants },
      } = singleMedia;

      return (response.data = variants[0]);
    }
  }
}

export { startTwitFeed, stopTwitFeed, checkFeedingState };
