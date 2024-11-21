import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { TWEETS_MESSAGES } from '~/constants/message';
import { SearchQuery } from '~/models/requests/search.requests';
import { TokenPayload } from '~/models/requests/user.requests';
import searchService from '~/services/search.services';

export const searchController = async (
  req: Request<ParamsDictionary, any, any, SearchQuery>,
  res: Response,
  next: NextFunction
) => {
  const { content, limit, page } = req.query;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const { result, total } = await searchService.searchAdvance({
    content,
    limit: Number(limit),
    page: Number(page),
    user_id
  });

  return res.send({
    message: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
    result: {
      data: result,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total
      }
    }
  });
};
