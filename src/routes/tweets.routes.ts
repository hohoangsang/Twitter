import express from 'express';
import {
  createTweetController,
  getTweetChildrensController,
  getTweetController
} from '~/controllers/tweets.controller';
import {
  audienceValidator,
  createTweetValidator,
  tweetIdValidator
} from '~/middlewares/tweets.middleware';
import {
  accessTokenValidator,
  isUserLoggedInValidator,
  loginValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const tweetRouter = express.Router();

/**
 * Descriptions: Create tweet
 * Methods: POST
 * Path: /post
 * Body: {
 *    content: string;
 *    audience: TweetAudience;
 *    medias: Media[];
 *    hashtags: string[];
 *    mentions: string[];
 *    parentId: string | null;
 *    type: TweetType;
 *    _id?: ObjectId;
 *    user_id: ObjectId;
 * }
 */

tweetRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
);

/**
 * Descriptions: get tweet detail
 * Methods: get
 * Path: /:tweet_id
 */

tweetRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
);

/**
 * Descriptions: get tweet childrens
 * Methods: get
 * Path: /:tweet_id/children
 * Query: {
 *  type: TweetType,
 *  page: string,
 *  limit: string
 * }
 */
tweetRouter.get(
  '/:tweet_id/childrens',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrensController)
);

export default tweetRouter;
