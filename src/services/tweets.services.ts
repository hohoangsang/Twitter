import Tweet, { TweetConstructor } from '~/models/schemas/tweet.schema';
import { config } from 'dotenv';
import databaseService from './database.services';
import { TWEETS_MESSAGES } from '~/constants/message';
import { TweetReqBody } from '~/models/requests/tweets.request';

config();

class TweetsService {
  async createTweets(body: TweetReqBody, user_id: string) {
    const { audience, content, parent_id, type, hashtags, medias, mentions } = body;

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        content,
        audience,
        parent_id,
        type,
        user_id,
        medias,
        hashtags: [],
        mentions
      })
    );

    const newlyTweet = await databaseService.tweets.findOne({ _id: result.insertedId });

    return newlyTweet;
  }
}

const tweetsService = new TweetsService();

export default tweetsService;
