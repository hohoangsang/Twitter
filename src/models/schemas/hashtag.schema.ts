import _ from 'lodash';
import { ObjectId } from 'mongodb';

export default class Hashtag {
  _id?: ObjectId;
  name: string;
  created_at: Date;

  constructor({ name, _id, created_at }: { _id?: ObjectId; name: string; created_at?: Date }) {
    const date = new Date();

    this._id = _id || new ObjectId();
    this.name = name;
    this.created_at = created_at || date;
  }
}
