import { NextFunction, Request, Response } from 'express';
import { checkSchema, ParamSchema } from 'express-validator';
import { isEmpty } from 'lodash';
import { ObjectId } from 'mongodb';
import { TweetAudience, TweetType, UserVerifyStatus } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { TWEETS_MESSAGES, USERS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import { TokenPayload } from '~/models/requests/user.requests';
import Tweet from '~/models/schemas/tweet.schema';
import databaseService from '~/services/database.services';
import { wrapRequestHandler } from '~/utils/handlers';
import { isMediaType, validate } from '~/utils/validation';

export const paginationSchema: Record<string, ParamSchema> = {
  page: {
    isNumeric: true,
    custom: {
      options: (value) => {
        const num = Number(value);

        if (num < 1) {
          throw Error('page >= 1');
        }

        return true;
      }
    }
  },
  limit: {
    isNumeric: true,
    custom: {
      options: (value) => {
        const num = Number(value);
        if (num > 100 || num < 1) {
          throw new Error('1 <= limit <= 100');
        }

        return true;
      }
    }
  }
};

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.TYPE_IS_REQUIRED
        },
        // isIn: {
        //   options: Object.values(TweetType),

        //   errorMessage: TWEETS_MESSAGES.INVALID_TYPE
        // },
        custom: {
          options: async (value) => {
            if (!Object.values(TweetType).includes(value)) {
              throw new Error(TWEETS_MESSAGES.INVALID_TYPE);
            }

            return true;
          }
        }
      },
      audience: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.AUDIENCE_IS_REQUIRED
        },
        // isIn: {
        //   options: Object.values(TweetAudience),
        //   errorMessage: TWEETS_MESSAGES.INVALID_AUDIENCE
        // },
        custom: {
          options: async (value) => {
            if (!Object.values(TweetAudience).includes(value)) {
              throw new Error(TWEETS_MESSAGES.INVALID_AUDIENCE);
            }

            return true;
          }
        }
      },
      medias: {
        custom: {
          options: async (value, { req }) => {
            if (!value) return true;

            const isArray = Array.isArray(value);

            if (!isArray) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT);
            }

            if (value.some((item: any) => !isMediaType(item))) {
              throw new Error(TWEETS_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECT);
            }

            return true;
          }
        }
      },
      hashtags: {
        custom: {
          options: async (value, { req }) => {
            if (!value) return true;

            const isArray = Array.isArray(value);

            if (!isArray) {
              throw new Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING);
            }

            if (value.some((item: any) => typeof item !== 'string')) {
              throw Error(TWEETS_MESSAGES.HASHTAGS_MUST_BE_AN_ARRAY_OF_STRING);
            }
          }
        }
      },
      mentions: {
        custom: {
          options: async (value, { req }) => {
            if (!value) return true;

            const isArray = Array.isArray(value);

            if (!isArray) {
              throw new Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID);
            }

            if (value.some((item: any) => !ObjectId.isValid(item) || typeof item === 'number')) {
              throw Error(TWEETS_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID);
            }
          }
        }
      },
      parent_id: {
        custom: {
          options: async (value, { req }) => {
            const type = (req as Request).body.type;

            if (type === TweetType.Tweet && value != null) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_NULL);
            }

            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Retweet].includes(type) &&
              (!ObjectId.isValid(value) || typeof value === 'number')
            ) {
              throw new Error(TWEETS_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID);
            }

            return true;
          }
        }
      },
      content: {
        custom: {
          options: async (value, { req }) => {
            const type = (req as Request).body.type;
            const hashtags = (req as Request).body.hashtags;
            const mentions = (req as Request).body.mentions;

            if (type === TweetType.Retweet && value !== '' && value != null) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_EMPTY_STRING);
            }

            if (
              [TweetType.Comment, TweetType.Tweet].includes(type) &&
              isEmpty(hashtags) &&
              isEmpty(mentions) &&
              (value === '' || value == null)
            ) {
              throw new Error(TWEETS_MESSAGES.CONTENT_MUST_BE_A_NON_EMPTY_STRING);
            }
          }
        }
      }
    },
    ['body']
  )
);

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value) || typeof value !== 'string') {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEETS_MESSAGES.TWEET_ID_MUST_BE_A_VALID_TWEET_ID
              });
            }

            const tweet = (
              await databaseService.tweets
                .aggregate<Tweet>([
                  {
                    $match: {
                      _id: new ObjectId(value)
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
                    $addFields: {
                      mentions: {
                        $map: {
                          input: '$mentions',
                          as: 'mention',
                          in: {
                            _id: '$$mention._id',
                            username: '$$mention.username',
                            name: '$$mention.name',
                            email: '$$mention.email',
                            avatar: '$$mention.avatar'
                          }
                        }
                      }
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
                ])
                .toArray()
            )[0];

            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND
              });
            }

            (req as Request).tweet = tweet;

            return true;
          }
        }
      }
    },
    ['body', 'params', 'query']
  )
);

export const audienceValidator = wrapRequestHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const tweet = req.tweet as Tweet;

    if (tweet.audience === TweetAudience.TwitterCircle) {
      //Kiểm tra user đã đăng nhập hay chưa
      if (!req.headers.authorization) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.UNAUTHORIZED,
          message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        });
      }

      //Kiểm tra tài khoản của tác giả có còn hoạt động không (chưa bị xoá và không bị trạng thái BAN)
      const author = tweet.user_id;
      const user = await databaseService.users.findOne({ _id: author });
      if (!user || user.verify === UserVerifyStatus.Banned) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGES.USER_NOT_FOUND
        });
      }

      //Kiểm tra user gọi api có nằm trong twitter_circle của tác giả không, hoặc user call api chính là tác giả thì vẫn xem được tweet
      const twitter_circle = user.twitter_circle;
      const { user_id: viewer_id } = req.decoded_authorization as TokenPayload;
      const isViewerExistTwitterCircle = twitter_circle.some((circle_id) =>
        circle_id.equals(viewer_id)
      );
      const isViewerIsAuthor = tweet.user_id.equals(viewer_id);

      if (!isViewerExistTwitterCircle && !isViewerIsAuthor) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.FORBIDEN,
          message: TWEETS_MESSAGES.TWEET_IS_NOT_PUBLIC
        });
      }
    }

    next();
  }
);

export const getTweetChildrensValidator = validate(
  checkSchema(
    {
      type: {
        custom: {
          options: (value) => {
            if (!value) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEETS_MESSAGES.TYPE_IS_REQUIRED
              });
            }

            if (!Object.values(TweetType).includes(value)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEETS_MESSAGES.INVALID_TYPE
              });
            }

            return true;
          }
        }
      },
      ...paginationSchema
    },
    ['query']
  )
);

export const getNewFeedValidator = validate(
  checkSchema({
    ...paginationSchema
  })
);
