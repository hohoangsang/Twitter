import { Request } from 'express';
import { checkSchema } from 'express-validator';
import { isEmpty } from 'lodash';
import { ObjectId } from 'mongodb';
import { TweetAudience, TweetType } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { TWEETS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import databaseService from '~/services/database.services';
import { isMediaType, validate } from '~/utils/validation';

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

            const tweet = await databaseService.tweets.findOne({
              _id: new ObjectId(value)
            });

            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEETS_MESSAGES.TWEET_NOT_FOUND
              });
            }

            return true;
          }
        }
      }
    },
    ['body', 'params']
  )
);
