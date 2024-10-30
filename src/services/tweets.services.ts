import Tweet, { TweetConstructor } from '~/models/schemas/tweet.schema';
import { config } from 'dotenv';
import databaseService from './database.services';
import { TWEETS_MESSAGES } from '~/constants/message';
import { TweetReqBody } from '~/models/requests/tweets.request';
import hashtagsService from './hashtag.services';
import { ObjectId } from 'mongodb';

config();

class TweetsService {
  async createTweets(body: TweetReqBody, user_id: string) {
    const { audience, content, parent_id, type, hashtags, medias, mentions } = body;

    const hashtagsObjectId = await hashtagsService.checkAndCreateHashtags(hashtags || []);

    // const objectHashtag: { [key: string]: ObjectId | undefined } = {};

    // //init objectHashtag
    // hashtags?.forEach((item: string) => (objectHashtag[item] = undefined));

    // const existedHashtags = await hashtagsService.findManyHashtag({
    //   key: 'name',
    //   arrIn: hashtags || []
    // });

    // const existedHashtagsName = existedHashtags.map((item) => {
    //   objectHashtag[item.name] = item._id;
    //   return item.name;
    // });

    // const newHashtagNames = hashtags?.filter(
    //   (name) => Boolean(existedHashtagsName.includes(name)) === false
    // );

    // if (newHashtagNames?.length) {
    //   const arrayNewHashTag = await hashtagsService.insertManyHashtag(newHashtagNames);
    //   arrayNewHashTag.forEach((item) => {
    //     if (!objectHashtag[item.name]) objectHashtag[item.name] = item._id;
    //   });
    // }

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        content,
        audience,
        parent_id,
        type,
        user_id,
        medias,
        hashtags: hashtagsObjectId,
        mentions
      })
    );

    const newlyTweet = await databaseService.tweets.findOne({ _id: result.insertedId });

    return newlyTweet;
  }
}

const tweetsService = new TweetsService();

export default tweetsService;
