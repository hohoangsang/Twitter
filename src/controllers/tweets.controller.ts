import { ParamsDictionary } from 'express-serve-static-core';
import { NextFunction, Request, Response } from 'express';
import { GetTweetChildrenQuery, TweetReqBody } from '~/models/requests/tweets.request';
import tweetsService from '~/services/tweets.services';
import Tweet, { TweetConstructor } from '~/models/schemas/tweet.schema';
import { TokenPayload } from '~/models/requests/users.requests';
import { TWEETS_MESSAGES } from '~/constants/message';
import { ObjectId } from 'mongodb';
import { TweetType } from '~/constants/enum';

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
    guest_views: result.guest_views,
    updated_at: result.updated_at
  };

  return res.send({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result: tweet
  });
};

export const getTweetChildrensController = async (
  req: Request<{ tweet_id: string }, any, any, GetTweetChildrenQuery>,
  res: Response,
  next: NextFunction
) => {
  const { type, limit, page } = req.query;
  const { tweet_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const { childrens, total } = await tweetsService.getTweetChildrens({
    page: Number(page),
    limit: Number(limit),
    type: type as TweetType,
    tweet_id,
    user_id
  });

  return res.send({
    message: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
    result: {
      childrens,
      pagination: {
        limit: Number(limit),
        page: Number(page),
        total
      }
    }
  });
};
