import { ObjectId } from 'mongodb';
import { TweetAudience, TweetType } from '~/constants/enum';
import { Media } from '../Other';

export interface TweetReqBody {
  _id?: ObjectId;
  user_id: ObjectId;
  content: string;
  audience: TweetAudience;
  medias?: Media[];
  hashtags?: ObjectId[];
  mentions?: ObjectId[];
  parent_id: null | string; //  chỉ null khi tweet gốc
  type: TweetType;
}
