import { Request, Response, NextFunction } from 'express';
import { BOOKMARK_MESSAGES } from '~/constants/message';
import { BookmarkReqBody } from '~/models/requests/bookmark.requests';
import { TokenPayload } from '~/models/requests/user.requests';
import bookmarksService from '~/services/bookmarks.services';

export const createBookmarkTweetController = async (
  request: Request<any, any, BookmarkReqBody>,
  response: Response
) => {
  const { user_id } = request.decoded_authorization as TokenPayload;
  const { tweet_id } = request.body;

  const result = await bookmarksService.createBookmark({ tweet_id, user_id });

  return response.send({
    message: BOOKMARK_MESSAGES.BOOKMARK_SUCCESSFULLY,
    result
  });
};

export const unBookmarkTweetController = async (
  request: Request<{ tweet_id: string }>,
  response: Response
) => {
  const { user_id } = request.decoded_authorization as TokenPayload;
  const { tweet_id } = request.params;

  const result = await bookmarksService.unBookmark({ tweet_id, user_id });

  return response.send({
    message: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY,
    result
  });
};
