import { checkSchema } from 'express-validator';
import { ObjectId } from 'mongodb';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { TWEETS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import { validate } from '~/utils/validation';

export const createLikeValidator = validate(
  checkSchema(
    {
      tweet_id: {
        notEmpty: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.TWEET_ID_MUST_BE_A_VALID_TWEET_ID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }

            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const unLikeValidator = validate(
  checkSchema(
    {
      tweetId: {
        notEmpty: true,
        custom: {
          options: async (value, { req }) => {
            if (!ObjectId.isValid(value)) {
              throw new ErrorWithStatus({
                message: TWEETS_MESSAGES.TWEET_ID_MUST_BE_A_VALID_TWEET_ID,
                status: HTTP_STATUS.BAD_REQUEST
              });
            }

            return true;
          }
        }
      }
    },
    ['params']
  )
);
