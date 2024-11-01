import { Request, Response } from 'express';
import { LIKE_MESSAGES } from '~/constants/message';
import { LikeReqBody } from '~/models/requests/likes.request';
import { TokenPayload } from '~/models/requests/users.requests';
import likeService from '~/services/likes.services';

export const likeTweetController = async (
  request: Request<any, any, LikeReqBody>,
  response: Response
) => {
  const { user_id } = request.decoded_authorization as TokenPayload;
  const { tweet_id } = request.body;

  const result = await likeService.like({ tweet_id, user_id });

  return response.send({
    message: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
    result
  });
};

export const unLikeTweetController = async (
  request: Request<{ tweetId: string }>,
  response: Response
) => {
  const { user_id } = request.decoded_authorization as TokenPayload;
  const { tweetId: tweet_id } = request.params;

  const result = await likeService.unLike({ tweet_id, user_id });

  return response.send({
    message: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY,
    result
  });
};
