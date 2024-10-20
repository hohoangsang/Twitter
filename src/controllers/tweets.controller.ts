import { ParamsDictionary } from 'express-serve-static-core';
import { NextFunction, Request, Response } from 'express';
import { TweetReqBody } from '~/models/requests/tweets.request';

export const createTweetController = async (
  request: Request<ParamsDictionary, any, TweetReqBody>,
  res: Response,
  next: NextFunction
) => {
  return res.send({
    message: 'OK'
  });
};
