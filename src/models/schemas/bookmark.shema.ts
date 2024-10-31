import { ObjectId } from 'mongodb';

interface BookmarkType {
  _id?: ObjectId;
  user_id: string;
  tweet_id: string;
  created_at?: Date;
}

export default class Bookmarks {
  _id: ObjectId;
  user_id: ObjectId;
  tweet_id: ObjectId;
  created_at: Date;

  constructor({ tweet_id, user_id, _id, created_at }: BookmarkType) {
    this._id = _id || new ObjectId();
    this.user_id = new ObjectId(user_id);
    this.tweet_id = new ObjectId(tweet_id);
    this.created_at = created_at || new Date();
  }
}
