import { ObjectId } from 'mongodb';
import { EncodeHLSType } from '~/constants/enum';

interface StatusVideosType {
  _id?: ObjectId;
  idName: string;
  status: EncodeHLSType;
  created_at?: Date;
  updated_at?: Date;
}

export default class StatusVideos {
  _id?: ObjectId;
  idName: string;
  status: EncodeHLSType;
  created_at: Date;
  updated_at: Date;

  constructor({ _id, status, created_at, updated_at, idName }: StatusVideosType) {
    const date = new Date();

    this._id = _id;
    this.idName = idName;
    this.status = status;
    this.created_at = created_at || date;
    this.updated_at = updated_at || date;
  }
}
