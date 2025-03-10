import { config } from 'dotenv';
import databaseService from './database.services';
import Tweet from '~/models/schemas/tweet.schema';
import { Document, ObjectId } from 'mongodb';
import { MediaType, PeopleSearchType, SearchType, TweetType } from '~/constants/enum';
import tweetsService from './tweets.services';
import usersService from './users.services';

config();

export type SearchArg = {
  limit: number;
  page: number;
  searchString: string;
  user_id: string;
  media?: string;
  type: SearchType;
  people?: PeopleSearchType;
};

class SearchService {
  async search({ limit, media, page, searchString, type, user_id, people }: SearchArg) {
    if (type === SearchType.CONTENT) {
      return await this.searchTweet({ limit, media, page, searchString, user_id, people });
    }

    if (type === SearchType.HASHTAG) {
      return await this.searchTweetByHashtag({ limit, media, page, searchString, user_id, people });
    }

    return {
      tweets: [],
      total: 0
    };
  }

  async searchTweet({
    searchString,
    limit,
    page,
    user_id,
    media,
    people
  }: Omit<SearchArg, 'type'>) {
    let tweets: Tweet[] = [];
    let totalCountTweets: Document[] = [];

    const matchContent: any = {
      $text: {
        $search: searchString
      }
    };

    const matchTweetsForAnyone: any = {
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
    };

    let matchTweetsStage = matchTweetsForAnyone; //default

    if (people === PeopleSearchType.FOLLOWING) {
      const followedUser = (await usersService.getFollowing({ user_id })).result;
      const followedUserObjIDs = followedUser.map((user) => user.followed_user_id);
      const matchTweetsForFollowing: any = {
        user_id: {
          $in: followedUserObjIDs
        }
      };
      matchTweetsStage = matchTweetsForFollowing;
    }

    if (media === 'true') {
      matchContent['medias.type'] = {
        $in: [MediaType.HLS, MediaType.Image, MediaType.Video]
      };
    }

    const [result, totalCountResult] = await Promise.all([
      databaseService.tweets
        .aggregate<Tweet>([
          {
            $match: matchContent
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
            $match: matchTweetsStage
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
            $match: matchContent
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
            $match: matchTweetsStage
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ]);

    tweets = result;
    totalCountTweets = totalCountResult;

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

  async searchTweetByHashtag({
    limit,
    media,
    page,
    searchString,
    user_id,
    people
  }: Omit<SearchArg, 'type'>) {
    let tweets: Tweet[] = [];
    let totalCountTweets: Document[] = [];

    const matchTweetsForAnyone: any = {
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
    };

    let matchTweets: any = matchTweetsForAnyone; //default;

    if (people === PeopleSearchType.FOLLOWING) {
      const followedUser = (await usersService.getFollowing({ user_id })).result;
      const followedUserObjIDs = followedUser.map((user) => user.followed_user_id);
      const matchTweetsForFollowing: any = {
        user_id: {
          $in: followedUserObjIDs
        }
      };
      matchTweets = matchTweetsForFollowing;
    }

    if (media === 'true') {
      matchTweets['medias.type'] = {
        $in: [MediaType.HLS, MediaType.Image, MediaType.Video]
      };
    }

    const [result, totalCountResult] = await Promise.all([
      databaseService.hashtags
        .aggregate<Tweet>([
          {
            $match: {
              $text: {
                $search: searchString
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
            $match: matchTweets
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
                $search: searchString
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
            $match: matchTweets
          },
          {
            $count: 'total'
          }
        ])
        .toArray()
    ]);

    tweets = result;
    totalCountTweets = totalCountResult;

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
