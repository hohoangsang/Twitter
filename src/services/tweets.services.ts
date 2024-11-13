import Tweet, { TweetConstructor } from '~/models/schemas/tweet.schema';
import { config } from 'dotenv';
import databaseService from './database.services';
import { TWEETS_MESSAGES } from '~/constants/message';
import { TweetReqBody } from '~/models/requests/tweet.requests';
import hashtagsService from './hashtag.services';
import { Document, ObjectId, WithId } from 'mongodb';
import { TweetType } from '~/constants/enum';

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
        user_id: new ObjectId(user_id),
        medias,
        hashtags: hashtagsObjectId,
        mentions
      })
    );

    const newlyTweet = await databaseService.tweets.findOne({ _id: result.insertedId });

    return newlyTweet;
  }

  async increaseViewTweet({ tweet_id, user_id }: { tweet_id: string; user_id?: string }) {
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
    const result = await databaseService.tweets.findOneAndUpdate(
      {
        _id: new ObjectId(tweet_id)
      },
      {
        $inc: inc,
        $currentDate: {
          updated_at: true
        }
      },
      {
        returnDocument: 'after',
        projection: {
          user_views: 1,
          guest_views: 1,
          updated_at: 1
        }
      }
    );

    return result as WithId<{
      user_views: number;
      guest_views: number;
      updated_at: Date;
    }>;
  }

  async getTweetChildrens({
    type,
    limit = 0,
    page,
    tweet_id,
    user_id
  }: {
    type: TweetType;
    page?: number;
    limit?: number;
    tweet_id: string;
    user_id?: string;
  }) {
    const aggregateArray: Document[] = [
      {
        $match: {
          parent_id: new ObjectId(tweet_id),
          type
        }
      },
      {
        $lookup: {
          from: 'hashtags',
          localField: 'hashtags',
          foreignField: '_id',
          as: 'hashtags'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'mentions',
          foreignField: '_id',
          as: 'mentions'
        }
      },
      {
        $lookup: {
          from: 'bookmarks',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'bookmarks'
        }
      },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'tweet_id',
          as: 'likes'
        }
      },
      {
        $lookup: {
          from: 'tweets',
          localField: '_id',
          foreignField: 'parent_id',
          as: 'tweet_children'
        }
      },
      {
        $addFields: {
          mentions: {
            $map: {
              input: '$mentions',
              as: 'item',
              in: {
                _id: '$$item._id',
                name: '$$item.name',
                username: '$$item.username',
                avatar: '$$item.avatar'
              }
            }
          },
          bookmarks: {
            $size: '$bookmarks'
          },
          likes: {
            $size: '$likes'
          },
          retweet_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Retweet]
                }
              }
            }
          },
          comment_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.Comment]
                }
              }
            }
          },
          quote_count: {
            $size: {
              $filter: {
                input: '$tweet_children',
                as: 'item',
                cond: {
                  $eq: ['$$item.type', TweetType.QuoteTweet]
                }
              }
            }
          }
        }
      },
      {
        $project: {
          tweet_children: 0
        }
      }
    ];

    if (page && limit) {
      aggregateArray.push(
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      );
    }

    const result = await databaseService.tweets.aggregate<Tweet>(aggregateArray).toArray();

    const tweetIds = result.map((tweet) => tweet._id as ObjectId);
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
    const date = new Date();

    const [, total] = await Promise.all([
      //Query tăng view cho nhiều tweet
      databaseService.tweets.updateMany(
        {
          _id: {
            $in: tweetIds
          }
        },
        {
          $inc: inc,
          $set: {
            updated_at: date
          }
        }
      ),
      databaseService.tweets.countDocuments({
        parent_id: new ObjectId(tweet_id),
        type
      })
    ]);

    return {
      childrens: result.map((item) => ({
        ...item,
        guest_views: user_id ? item.guest_views : item.guest_views + 1,
        user_views: user_id ? item.user_views + 1 : item.user_views,
        updated_at: date
      })),
      total
    };
  }
}

const tweetsService = new TweetsService();

export default tweetsService;
