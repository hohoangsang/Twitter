import { ObjectId } from 'mongodb';

export interface BookmarkReqBody {
  _id?: ObjectId;
  tweet_id: string;
}
