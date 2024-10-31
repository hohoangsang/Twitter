import express from 'express';
import { createBookmarkController, unBookmarkController } from '~/controllers/bookmarks.controller';
import { createBookmarkValidator, unBookmarkValidator } from '~/middlewares/bookmarks.middleware';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const bookmarksRouter = express.Router();

/**
 * Description: Create bookmark
 * Methods: POST
 * Path: /
 * Body: {
 *    tweet_id: string
 * }
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
bookmarksRouter.post(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  createBookmarkValidator,
  wrapRequestHandler(createBookmarkController)
);

/**
 * Description: unBookmark
 * Methods: DELETE
 * Path: /
 * params: {
 *    tweetId: string
 * }
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
bookmarksRouter.delete(
  '/tweet/:tweetId',
  accessTokenValidator,
  verifiedUserValidator,
  unBookmarkValidator,
  wrapRequestHandler(unBookmarkController)
);

export default bookmarksRouter;
