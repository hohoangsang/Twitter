import express from 'express';
import { likeTweetController, unLikeTweetController } from '~/controllers/likes.controller';
import { tweetIdValidator } from '~/middlewares/tweets.middleware';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const likesRouter = express.Router();

/**
 * Description: Create like
 * Methods: POST
 * Path: /
 * Body: {
 *    tweet_id: string
 * }
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
likesRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController)
);

/**
 * Description: unLike
 * Methods: DELETE
 * Path: /tweet/:tweetId
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
likesRouter.delete(
  '/tweet/:tweetId',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeTweetController)
);

export default likesRouter;
