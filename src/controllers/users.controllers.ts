import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import {
  ChangePasswordReqBody,
  EmailVerifyReqBody,
  FollowUserReqBody,
  ForgotPasswordReqBody,
  GetProfileReqParams,
  LoginReqBody,
  LogoutReqBody,
  RefreshTokenReqBody,
  RegisterReqBody,
  ResetPasswordReqBody,
  TokenPayload,
  UnFollowUserReqParams,
  VerifyForgotPasswordTokenReqBody
} from '~/models/requests/users.requests';
import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';

export const loginController = async (
  req: Request<ParamsDictionary, any, LoginReqBody>,
  res: Response
) => {
  const user = req?.user as User;

  const userId = user._id as ObjectId;
  const verify = user.verify;

  const result = await usersService.login({ user_id: userId.toString(), verify });

  return res.send({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  });
};

export const oauthController = async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.query;

  const result = await usersService.oauth(code as string);

  const urlRedirect = `${process.env.CLIENT_LOGIN_OAUTH}?access_token=${result.access_token}&refresh_token=${result.refresh_token}&new_user=${result.new_user}&verified=${result.verified}`;

  return res.redirect(urlRedirect);
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterReqBody>,
  res: Response
) => {
  const result = await usersService.register(req.body);

  return res.send({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  });
};

export const refreshTokenController = async (
  req: Request<ParamsDictionary, any, RefreshTokenReqBody>,
  res: Response
) => {
  const { user_id } = req.decoded_refresh_token as TokenPayload;
  const { refresh_token } = req.body;
  const result = await usersService.refreshToken({ user_id, refreshTokenReq: refresh_token });

  return res.send({
    message: USERS_MESSAGES.REFRESH_TOKEN_SUCCESS,
    result
  });
};

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutReqBody>,
  res: Response
) => {
  const { refresh_token } = req.body;

  const result = await usersService.logout(refresh_token);

  return res.send({
    message: result.message
  });
};

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, EmailVerifyReqBody>,
  res: Response
) => {
  const { email_verify_token } = req.body;
  const { user_id } = req.decoded_email_verify as TokenPayload;

  const user = await databaseService.users.findOne({ email_verify_token });

  if (!user) {
    throw new ErrorWithStatus({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE,
      status: HTTP_STATUS.NOT_FOUND
    });
  }

  const result = await usersService.verifyEmail(user_id);

  return res.send({
    message: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS,
    result
  });
};

export const resendVerifyEmailController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).send({
      message: USERS_MESSAGES.USER_NOT_FOUND
    });
  }

  if (user.verify === UserVerifyStatus.Verified) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send({
      message: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
    });
  }

  const result = await usersService.resendVerifyEmail(user_id);

  return res.send(result);
};

export const forgotPasswordController = async (
  req: Request<ParamsDictionary, any, ForgotPasswordReqBody>,
  res: Response
) => {
  const { _id, verify } = req.user as User;

  const result = await usersService.forgotPassword({ user_id: _id?.toString() as string, verify });

  return res.send(result);
};

export const verifyForgotPasswordController = async (
  req: Request<ParamsDictionary, any, VerifyForgotPasswordTokenReqBody>,
  res: Response
) => {
  return res.send({
    message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
  });
};

export const resetPasswordController = async (
  req: Request<ParamsDictionary, any, ResetPasswordReqBody>,
  res: Response
) => {
  const { password } = req.body;
  const { user_id } = req.decoded_forgot_password_token as TokenPayload;

  const result = await usersService.resetPassword(user_id, password);

  return res.send(result);
};

export const getMeController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;

  const user = await usersService.getMe(user_id);

  return res.send({
    message: USERS_MESSAGES.GET_ME_SUCCESS,
    result: user
  });
};

export const getProfileController = async (req: Request<GetProfileReqParams>, res: Response) => {
  const { username } = req.params;

  const user = await usersService.getProfile(username);

  return res.send({
    message: USERS_MESSAGES.GET_PROFILE_SUCCESS,
    result: user
  });
};

export const updateMeController = async (req: Request, res: Response, next: NextFunction) => {
  const body = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const result = await usersService.updateMe({ user_id, body });

  return res.json(result);
};

export const followUserController = async (
  req: Request<ParamsDictionary, any, FollowUserReqBody>,
  res: Response
) => {
  const { followed_user_id } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const result = await usersService.followUser({ user_id, followed_user_id });

  return res.json(result);
};

export const unfollowUserController = async (
  req: Request<UnFollowUserReqParams>,
  res: Response
) => {
  const { followedUserId: followed_user_id } = req.params;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const result = await usersService.unfollowUser({ user_id, followed_user_id });

  return res.json(result);
};

export const changePasswordController = async (
  req: Request<ParamsDictionary, any, ChangePasswordReqBody>,
  res: Response
) => {
  const { new_password } = req.body;
  const { user_id } = req.decoded_authorization as TokenPayload;

  const result = await usersService.changePassword({ new_password, user_id });

  return res.json(result);
};
