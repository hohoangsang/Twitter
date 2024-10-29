import { ParamsDictionary } from 'express-serve-static-core';
import { NextFunction, Request, Response } from 'express';
import { TweetReqBody } from '~/models/requests/tweets.request';
import tweetsService from '~/services/tweets.services';
import { TweetConstructor } from '~/models/schemas/tweet.schema';
import { TokenPayload } from '~/models/requests/users.requests';
import { TWEETS_MESSAGES } from '~/constants/message';

export const createTweetController = async (
  request: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = request.decoded_authorization as TokenPayload;
  const body = request.body;

  const result = await tweetsService.createTweets(body, user_id);

  return res.send({
    message: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
    result
  });
};
