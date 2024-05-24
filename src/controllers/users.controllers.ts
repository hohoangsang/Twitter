import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { USERS_MESSAGES } from '~/constants/message';
import {
  EmailVerifyBody,
  LogoutBody,
  RegisterBody,
  TokenPayload
} from '~/models/requests/users.requests';
import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';
import { ErrorWithStatus } from '~/models/errors';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { UserVerifyStatus } from '~/constants/enum';

export const loginController = async (req: Request, res: Response) => {
  const user = req?.user as User;

  const userId = user._id as ObjectId;

  const result = await usersService.login(userId.toString());

  return res.send({
    message: USERS_MESSAGES.LOGIN_SUCCESS,
    result
  });
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterBody>,
  res: Response
) => {
  const result = await usersService.register(req.body);

  return res.send({
    message: USERS_MESSAGES.REGISTER_SUCCESS,
    result
  });
};

export const logoutController = async (
  req: Request<ParamsDictionary, any, LogoutBody>,
  res: Response
) => {
  const { refresh_token } = req.body;

  const result = await usersService.logout(refresh_token);

  return res.send({
    message: result.message
  });
};

export const emailVerifyController = async (
  req: Request<ParamsDictionary, any, EmailVerifyBody>,
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
