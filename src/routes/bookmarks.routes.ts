import express from 'express';
import {
  createBookmarkTweetController,
  unBookmarkTweetController
} from '~/controllers/bookmarks.controller';
import { tweetIdValidator } from '~/middlewares/tweets.middleware';
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
  tweetIdValidator,
  wrapRequestHandler(createBookmarkTweetController)
);

/**
 * Description: unBookmark
 * Methods: DELETE
 * Path: /tweet/:tweetId
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
bookmarksRouter.delete(
  '/tweet/:tweetId',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkTweetController)
);

export default bookmarksRouter;
