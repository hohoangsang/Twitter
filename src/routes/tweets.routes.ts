import express from 'express';
import { createTweetController } from '~/controllers/tweets.controller';
import { createTweetValidator } from '~/middlewares/tweets.middleware';
import {
  accessTokenValidator,
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

export default tweetRouter;
