import { ObjectId } from 'mongodb';

interface RefreshTokenType {
  _id?: ObjectId;
  token: string;
  created_at?: Date;
  user_id: ObjectId;
  iat: number;
  exp: number;
}

export default class RefreshToken {
  _id?: ObjectId;
  token: string;
  created_at: Date;
  user_id: ObjectId;
  iat: Date;
  exp: Date;

  constructor({ _id, created_at, token, user_id, exp, iat }: RefreshTokenType) {
    this._id = _id;
    this.created_at = created_at || new Date();
    this.token = token;
    this.user_id = user_id;
    this.iat = new Date(iat * 1000); //convert Timestamp to Date
    this.exp = new Date(exp * 1000); //convert Timestamp to Date
  }
}
