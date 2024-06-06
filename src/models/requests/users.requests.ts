import { ParamsDictionary } from 'express-serve-static-core';
import { JwtPayload } from 'jsonwebtoken';
import { TokenType } from '~/constants/enum';

export type RegisterReqBody = {
  name: string;
  email: string;
  date_of_birth: string;
  password: string;
  confirm_password: string;
};

export type LogoutReqBody = {
  refresh_token: string;
};

export interface TokenPayload extends JwtPayload {
  user_id: string;
  type: TokenType;
}

export type EmailVerifyReqBody = {
  email_verify_token: string;
};

export type ForgotPasswordReqBody = {
  email: string;
};

export type LoginReqBody = {
  email: string;
  password: string;
};

export type VerifyForgotPasswordTokenReqBody = {
  forgot_password_token: string;
};

export type ResetPasswordReqBody = {
  password: string;
  confirm_password: string;
  forgot_password_token: string;
};

export type updateMeReqBody = {
  name?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  username?: string;
  avatar?: string;
  cover_photo?: string;
};

export interface GetProfileReqParams extends ParamsDictionary {
  username: string;
}

export type FollowUserReqBody = {
  followed_user_id: string;
};

export interface UnFollowUserReqParams extends ParamsDictionary {
  followedUserId: string;
}
