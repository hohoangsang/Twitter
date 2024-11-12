import { ObjectId } from 'mongodb';
import { TweetAudience, TweetType } from '~/constants/enum';
import { Media } from '../Other';
import { Query, ParamsDictionary } from 'express-serve-static-core';

export interface TweetReqBody {
  _id?: ObjectId;
  content: string;
  audience: TweetAudience;
  medias?: Media[];
  hashtags?: string[];
  mentions?: string[];
  parent_id: null | string; //  chỉ null khi tweet gốc
  type: TweetType;
}

export interface GetTweetChildrenQuery extends Query {
  type: TweetType;
  page: string;
  limit: string;
}

export interface TweetParams extends ParamsDictionary {
  tweet_id: string;
}
