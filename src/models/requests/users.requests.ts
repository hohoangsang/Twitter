import { JwtPayload } from 'jsonwebtoken';
import { TokenType } from '~/constants/enum';

export type RegisterBody = {
  name: string;
  email: string;
  date_of_birth: string;
  password: string;
  confirm_password: string;
};

export type LogoutBody = {
  refresh_token: string;
};

export interface TokenPayload extends JwtPayload {
  user_id: string;
  type: TokenType;
}

export type EmailVerifyBody = {
  email_verify_token: string;
};
