import express from 'express';
import { likeController, unLikeController } from '~/controllers/likes.controller';
import { createLikeValidator, unLikeValidator } from '~/middlewares/likes.middleware';
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
  createLikeValidator,
  wrapRequestHandler(likeController)
);

/**
 * Description: unLike
 * Methods: DELETE
 * Path: /
 * params: {
 *    tweetId: string
 * }
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
likesRouter.delete(
  '/tweet/:tweetId',
  accessTokenValidator,
  verifiedUserValidator,
  unLikeValidator,
  wrapRequestHandler(unLikeController)
);

export default likesRouter;
