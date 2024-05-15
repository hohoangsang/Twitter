import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { USERS_MESSAGES } from '~/constants/message';
import User from '~/models/schemas/user.schema';
import { RegisterBody } from '~/models/users/register';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';

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

export const logoutController = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;

  const result = await usersService.logout(refresh_token);

  return res.send({
    message: result.message
  });
};
