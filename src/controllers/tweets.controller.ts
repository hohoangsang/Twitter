import { ParamsDictionary } from 'express-serve-static-core';
import { NextFunction, Request, Response } from 'express';
import { TweetReqBody } from '~/models/requests/tweets.request';
import tweetsService from '~/services/tweets.services';
import Tweet, { TweetConstructor } from '~/models/schemas/tweet.schema';
import { TokenPayload } from '~/models/requests/users.requests';
import { TWEETS_MESSAGES } from '~/constants/message';
import { ObjectId } from 'mongodb';

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

export const getTweetController = async (
  req: Request<{ tweet_id: string }>,
  res: Response,
  next: NextFunction
) => {
  const result = await tweetsService.increaseViewTweet({
    tweet_id: req.params.tweet_id,
    user_id: req.decoded_authorization?.user_id
  });

  const tweet = {
    ...req.tweet,
    user_views: result.user_views,
    guest_views: result.guest_views
  };

  return res.send({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result: tweet
  });
};
