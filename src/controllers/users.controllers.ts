import { Request, Response } from 'express';
import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';

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

export const registerController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).send({
        message: 'Register Failed'
      });

    const result = await usersService.register({ email, password });

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
