import { ObjectId } from 'mongodb';
import { TweetAudience, TweetType } from '~/constants/enum';
import { Media } from '../Other';

export interface TweetConstructor {
  _id?: ObjectId;
  user_id: ObjectId;
  content: string;
  audience: TweetAudience;
  medias?: Media[];
  hashtags?: ObjectId[];
  mentions?: ObjectId[];
  parent_id: null | string; //  chỉ null khi tweet gốc
  type: TweetType;
  created_at?: Date;
  updated_at?: Date;
}

export default class Tweet {
  _id?: ObjectId;
  user_id: ObjectId;
  type: TweetType;
  audience: TweetAudience;
  content: string;
  parent_id: null | string;
  hashtags: ObjectId[];
  mentions: ObjectId[];
  medias: Media[];
  guest_views?: number;
  user_views?: number;
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
    user_id
  }: TweetConstructor) {
    const date = new Date();

    this._id = _id;
    this.user_id = user_id;
    this.type = type;
    this.audience = audience;
    this.content = content;
    this.parent_id = parent_id;
    this.hashtags = hashtags || [];
    this.mentions = mentions || [];
    this.medias = medias || [];
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}
