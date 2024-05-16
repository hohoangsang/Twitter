import User from '~/models/schemas/user.schema';
import { Request } from 'express';
import { TokenType } from '~/constants/enum';

declare module 'express' {
  interface Request {
    user?: User;
    decoded_authorization?: {
      user_id: string;
      type: TokenType.AccessToken;
      iat?: number;
      exp: number;
    };
    decoded_refresh_token?: {
      user_id: string;
      type: TokenType.RefreshToken;
      iat?: number;
      exp: number;
    };
  }
}
