import { ObjectId } from 'mongodb';
import { TweetAudience, TweetType } from '~/constants/enum';
import { Media } from '../Other';

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

export interface GetTweetChildrenQuery {
  type?: TweetType;
  page?: number;
  limit?: number;
}
