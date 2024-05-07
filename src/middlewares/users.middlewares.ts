import { NextFunction, Request, Response } from 'express';
import { checkSchema } from 'express-validator';
import { validate } from '~/utils/validation';

export const loginValidate = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send({
      message: 'Invalid email and password'
    });
  }

  next();
};

/**
 * Register body
 * {
 *    name: string;
 *    email: string;
 *    password: string;
 *    confirm_password: string;
 *    date_of_birth: ISO8601;
 * }
 */

export const registerValidate = validate(
  checkSchema({
    name: {
      exists: {
        errorMessage: 'Name is required'
      },
      isString: true,
      isLength: {
        options: {
          min: 1,
          max: 255
        }
      },
      trim: true
    },
    email: {
      exists: {
        errorMessage: 'Email is required'
      },
      isEmail: true,
      trim: true
    },
    password: {
      exists: {
        errorMessage: 'Password is required'
      },
      isString: true,
      isStrongPassword: {
        errorMessage: 'Password not strong',
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      }
    },
    confirm_password: {
      exists: {
        errorMessage: 'Confirm password is required'
      },
      isString: true,
      isStrongPassword: {
        errorMessage: 'Password not strong',
        options: {
          minLength: 6,
          minLowercase: 1,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1
        }
      },
      custom: {
        options: (value, { req }) => {
          const password = req.body.password;

          if (value !== password) {
            throw new Error('Confirm passwords do not match');
          }

          return true;
        }
      }
    },
    date_of_birth: {
      isISO8601: true
    }
  })
);
