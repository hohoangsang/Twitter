import { ObjectId } from 'mongodb';

export interface LikeReqBody {
  _id?: ObjectId;
  tweet_id: string;
}
