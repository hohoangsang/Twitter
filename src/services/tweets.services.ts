import Tweet, { TweetConstructor } from '~/models/schemas/tweet.schema';
import { config } from 'dotenv';
import databaseService from './database.services';
import { TWEETS_MESSAGES } from '~/constants/message';
import { TweetReqBody } from '~/models/requests/tweet.requests';
import hashtagsService from './hashtag.services';
import { Document, ObjectId, WithId } from 'mongodb';
import { TweetType } from '~/constants/enum';
import usersService from './users.services';

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

  async increateViewForManyTweet({
    tweetIds,
    updated_at
  }: {
    tweetIds: ObjectId[];
    updated_at: Date;
  }) {
    await databaseService.tweets.updateMany(
      {
        _id: {
          $in: tweetIds
        }
      },
      {
        $inc: {
          user_views: 1
        },
        $set: {
          updated_at
        }
      }
    );
  }

  async getTweetChildrens({
    type,
    limit = 0,
    page,
    tweet_id,
    user_id
  }: {
    type: TweetType;
    page: number;
    limit: number;
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
        $skip: limit * (page - 1)
      },
      {
        $limit: limit
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

    const result = await databaseService.tweets.aggregate<Tweet>(aggregateArray).toArray();

    const tweetIds = result.map((tweet) => tweet._id as ObjectId);
    const inc = user_id ? { user_views: 1 } : { guest_views: 1 };
    const date = new Date();

    const [, total] = await Promise.all([
      //Query tăng view cho nhiều tweet
      this.increateViewForManyTweet({ tweetIds, updated_at: date }),
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

  async getNewFeeds({ limit, page, user_id }: { page: number; limit: number; user_id: string }) {
    const followedUser = (await usersService.getFollowing({ user_id })).result;
    const followedUserObjIDs: ObjectId[] = followedUser.map((user) => user.followed_user_id);

    const [tweets, tweetsCount] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match:
              /**
               * Câu query get new feed tweet
               * User đăng nhập vào sẽ thấy được những tweet như sau:
               * - Những tweet user đó làm tác giả, những tweet của những người
               * mà user đó follow
               * - Đối với những tweet thuộc những người mình follow thì user sẽ thấy những tweet
               * thuộc 2 trường hợp:
               * 	+ tweet của người đó là public
               *		+ tweet đó thuộc twitter_circle của tác giả và trong twitter_circle đó có
               *			id của bạn.
               * - Các tweet được sort theo thời gian tạo mới nhất trước khi được phân trang
               */

              {
                $or: [
                  // User_id của account đăng nhập
                  {
                    user_id: new ObjectId(user_id)
                  },
                  //User_id của những người mình follow
                  {
                    user_id: {
                      $in: followedUserObjIDs
                    }
                  }
                ]
              }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 'EVERYONE'
                },
                {
                  user_id: new ObjectId(user_id)
                },
                {
                  $and: [
                    {
                      audience: 'TWITTERCIRCLE'
                    },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $sort: {
              created_at: -1
            }
          },
          {
            $skip: (page - 1) * limit
          },
          {
            $limit: limit
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
              tweet_children: 0,
              user: {
                password: 0,
                date_of_birth: 0,
                verify: 0,
                created_at: 0,
                updated_at: 0,
                twitter_circle: 0,
                forgot_password_token: 0,
                email_verify_token: 0
              }
            }
          }
        ])
        .toArray(),
      databaseService.tweets
        .aggregate<{ total: number }>([
          {
            $match:
              /**
               * Câu query get new feed tweet
               * User đăng nhập vào sẽ thấy được những tweet như sau:
               * - Những tweet user đó làm tác giả, những tweet của những người
               * mà user đó follow
               * - Đối với những tweet thuộc những người mình follow thì user sẽ thấy những tweet
               * thuộc 2 trường hợp:
               * 	+ tweet của người đó là public
               *		+ tweet đó thuộc twitter_circle của tác giả và trong twitter_circle đó có
               *			id của bạn.
               * - Các tweet được sort theo thời gian tạo mới nhất trước khi được phân trang
               */
              {
                $or: [
                  // User_id của account đăng nhập
                  {
                    user_id: new ObjectId(user_id)
                  },
                  //User_id của những người mình follow
                  {
                    user_id: {
                      $in: followedUserObjIDs
                    }
                  }
                ]
              }
          },
          {
            $lookup: {
              from: 'users',
              localField: 'user_id',
              foreignField: '_id',
              as: 'user'
            }
          },
          {
            $unwind: {
              path: '$user'
            }
          },
          {
            $match: {
              $or: [
                {
                  audience: 'EVERYONE'
                },
                {
                  user_id: new ObjectId(user_id)
                },
                {
                  $and: [
                    {
                      audience: 'TWITTERCIRCLE'
                    },
                    {
                      'user.twitter_circle': {
                        $in: [new ObjectId(user_id)]
                      }
                    }
                  ]
                }
              ]
            }
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ]);

    const tweetIds = tweets.map((item) => item._id as ObjectId);
    const date = new Date();

    await this.increateViewForManyTweet({ tweetIds, updated_at: date });

    return {
      tweets: tweets.map((item) => ({
        ...item,
        user_views: (item.user_views += 1),
        updated_at: date
      })),
      total: tweetsCount[0].total || 0
    };
  }
}

const tweetsService = new TweetsService();

export default tweetsService;
