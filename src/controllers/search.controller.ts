import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { TWEETS_MESSAGES } from '~/constants/message';
import { SearchTweetQuery } from '~/models/requests/search.requests';
import { TokenPayload } from '~/models/requests/user.requests';
import searchService from '~/services/search.services';

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchTweetQuery>,
  res: Response,
  next: NextFunction
) => {
  const { limit, page, searchString, type, media, people } = req.query;

  const { user_id } = req.decoded_authorization as TokenPayload;

  const { tweets, total } = await searchService.search({
    searchString,
    type,
    limit: Number(limit),
    page: Number(page),
    user_id,
    media,
    people
  });

  return res.send({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result: {
      data: tweets,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    }
  });
};
