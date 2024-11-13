import { ObjectId } from 'mongodb';
import { TweetAudience, TweetType } from '~/constants/enum';
import { Media } from '../Other';

export interface TweetConstructor {
  _id?: ObjectId;
  user_id: ObjectId;
  content?: string;
  audience: TweetAudience;
  medias?: Media[];
  hashtags?: ObjectId[];
  mentions?: string[]; // string dạng id
  parent_id: null | string; //  chỉ null khi tweet gốc
  type: TweetType;
  guest_views?: number;
  user_views?: number;
  created_at?: Date;
  updated_at?: Date;
}

export default class Tweet {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: null | ObjectId;
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: Media[];
  guest_views: number;
  user_views: number;
  created_at?: Date;
  updated_at?: Date;

  constructor({
    audience,
    content,
    hashtags,
    medias,
    mentions,
    parent_id,
    type,
    _id,
    created_at,
    updated_at,
    user_id,
    guest_views,
    user_views
  }: TweetConstructor) {
    const date = new Date();

    this._id = _id;
    this.user_id = user_id;
    this.type = type;
    this.audience = audience;
    this.content = content ? content.toString() : '';
    this.parent_id = parent_id ? new ObjectId(parent_id) : null;
    this.hashtags = hashtags || [];
    this.mentions = (mentions || []).map((item) => new ObjectId(item)) || [];
    this.medias = medias || [];
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
    this.guest_views = guest_views || 0;
    this.user_views = user_views || 0;
  }
}
