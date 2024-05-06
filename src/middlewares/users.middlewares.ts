import { NextFunction, Request, Response } from 'express';

export const loginValidate = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: 'Invalid email and password'
    });
  }

  next();
};
