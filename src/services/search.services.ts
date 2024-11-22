import { config } from 'dotenv';
import databaseService from './database.services';
import Tweet from '~/models/schemas/tweet.schema';
import { Document, ObjectId } from 'mongodb';
import { TweetType } from '~/constants/enum';
import tweetsService from './tweets.services';

config();

class SearchService {
  async searchTweet({
    content,
    hashtag,
    limit,
    page,
    user_id
  }: {
    limit: number;
    page: number;
    content: string;
    hashtag: string;
    user_id: string;
  }) {
    let tweets: Tweet[] = [];
    let totalCountTweets: Document[] = [];

    if (content) {
      const [result, totalCountResult] = await Promise.all([
        databaseService.tweets
          .aggregate<Tweet>([
            {
              $match: {
                $text: {
                  $search: content
                }
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
          .aggregate([
            {
              $match: {
                $text: {
                  $search: content
                }
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

      tweets = result;
      totalCountTweets = totalCountResult;
    }

    if (hashtag) {
      const [result, totalCountResult] = await Promise.all([
        databaseService.hashtags
          .aggregate<Tweet>([
            {
              $match: {
                $text: {
                  $search: hashtag
                }
              }
            },
            {
              $lookup: {
                from: 'tweets',
                localField: '_id',
                foreignField: 'hashtags',
                as: 'tweets'
              }
            },
            {
              $unwind: {
                path: '$tweets'
              }
            },
            {
              $replaceRoot: {
                newRoot: '$tweets'
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

        databaseService.hashtags
          .aggregate<Tweet>([
            {
              $match: {
                $text: {
                  $search: hashtag
                }
              }
            },
            {
              $lookup: {
                from: 'tweets',
                localField: '_id',
                foreignField: 'hashtags',
                as: 'tweets'
              }
            },
            {
              $unwind: {
                path: '$tweets'
              }
            },
            {
              $replaceRoot: {
                newRoot: '$tweets'
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

      tweets = result;
      totalCountTweets = totalCountResult;
    }

    const tweetIds = tweets.map((item) => item._id as ObjectId);
    const date = new Date();

    await tweetsService.increateViewForManyTweet({ tweetIds, updated_at: date });

    return {
      tweets: tweets.map((item) => ({
        ...item,
        user_views: (item.user_views += 1)
      })),
      total: totalCountTweets[0]?.total || 0
    };
  }
}

const searchService = new SearchService();

export default searchService;
