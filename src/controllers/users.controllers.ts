import { Request, Response } from 'express';
import usersService from '~/services/users.services';
import { ParamsDictionary } from 'express-serve-static-core';
import { RegisterBody } from '~/models/users/register';

export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (email === 'hoangsang@gmail.com' && password === '123123') {
    return res.json({
      message: 'Login success'
    });
  } else {
    return res.status(401).json({
      message: 'Login failed'
    });
  }
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterBody>,
  res: Response
) => {
  try {
    const result = await usersService.register(req.body);

    return res.send({
      mesage: 'Register Success',
      result
    });
  } catch (error) {
    return res.status(400).send({
      message: 'Register Failed',
      error
    });
  }
};
