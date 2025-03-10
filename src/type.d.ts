import User from '~/models/schemas/user.schema';
import { Request } from 'express';
import { TokenPayload } from '~/models/requests/user.requests';
import Tweet from './models/schemas/tweet.schema';

declare module 'express' {
  interface Request {
    user?: User;
    decoded_authorization?: TokenPayload;
    decoded_refresh_token?: TokenPayload;
    decoded_email_verify?: TokenPayload;
    decoded_forgot_password_token?: TokenPayload;
    tweet?: Tweet;
  }
}
