import { config } from 'dotenv';
import { NextFunction, Request, Response } from 'express';
import { ParamSchema, checkSchema } from 'express-validator';
import { JsonWebTokenError } from 'jsonwebtoken';
import { capitalize } from 'lodash';
import { ObjectId } from 'mongodb';
import { UserVerifyStatus } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { REGEX_USERNAME } from '~/constants/regex';
import { ErrorWithStatus } from '~/models/errors';
import { TokenPayload } from '~/models/requests/users.requests';
import databaseService from '~/services/database.services';
import usersService from '~/services/users.services';
import { hashPassword } from '~/utils/crypto';
import { verifyToken } from '~/utils/jwt';
import { validate } from '~/utils/validation';

config();

const passwordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
    options: {
      minLength: 6,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    }
  }
};

const confirmPasswordSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
  },
  isLength: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
    options: {
      min: 6,
      max: 50
    }
  },
  isStrongPassword: {
    errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG,
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
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD);
      }

      return true;
    }
  }
};

const forgotPasswordTokenSchema: ParamSchema = {
  custom: {
    options: async (value, { req }) => {
      try {
        if (!value) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.NOT_FOUND,
            message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
          });
        }

        const decoded_forgot_password_token = await verifyToken({
          token: value,
          secretOrPublicKey: process.env.PRIVATE_KEY_FORGOT_PASSWORD_TOKEN as string
        });

        const { user_id } = decoded_forgot_password_token;

        const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });

        if (!user) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.USER_NOT_FOUND,
            status: HTTP_STATUS.NOT_FOUND
          });
        }

        if (user.forgot_password_token !== value) {
          throw new ErrorWithStatus({
            message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
            status: HTTP_STATUS.NOT_FOUND
          });
        }

        (req as Request).decoded_forgot_password_token = decoded_forgot_password_token;
      } catch (error) {
        if (error instanceof JsonWebTokenError) {
          throw new ErrorWithStatus({
            status: HTTP_STATUS.BAD_REQUEST,
            message: capitalize(error.message)
          });
        }

        if (error instanceof ErrorWithStatus) {
          throw error;
        }

        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: (error as any).message
        });
      }
    }
  }
};

const dateOfBirthSchema: ParamSchema = {
  optional: true,
  isISO8601: {
    errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601,
    options: {
      strict: true,
      strictSeparator: true
    }
  }
};

const nameSchema: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
  },
  isLength: {
    errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_255,
    options: {
      min: 1,
      max: 255
    }
  },
  trim: true
};

const followedUserIdSchema: ParamSchema = {
  custom: {
    options: async (value: string, { req }) => {
      if (!ObjectId.isValid(value)) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.BAD_REQUEST,
          message: USERS_MESSAGES.INVALID_USER_ID
        });
      }

      const followedUser = await databaseService.users.findOne({ _id: new ObjectId(value) });
      if (!followedUser) {
        throw new ErrorWithStatus({
          status: HTTP_STATUS.NOT_FOUND,
          message: USERS_MESSAGES.USER_NOT_FOUND
        });
      }

      return true;
    }
  }
};

/**
 * Login body
 * {
 *    email: string;
 *    password: string;
 * }
 */

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            });

            if (!user) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT
              });
            }

            req.user = user;
            return true;
          }
        }
      },
      password: passwordSchema
    },
    ['body']
  )
);

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

export const registerValidator = validate(
  checkSchema(
    {
      name: nameSchema,
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value) => {
            const isExistEmail = await usersService.checkExistEmail(value);

            if (isExistEmail) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.EMAIL_ALREADY_EXISTS
              });
            }

            return true;
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          errorMessage: USERS_MESSAGES.PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
          options: {
            min: 6,
            max: 50
          }
        },
        isStrongPassword: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG,
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
        notEmpty: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_A_STRING
        },
        isLength: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_LENGTH_MUST_BE_FROM_6_TO_50,
          options: {
            min: 6,
            max: 50
          }
        },
        isStrongPassword: {
          errorMessage: USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_STRONG,
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
              throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD);
            }

            return true;
          }
        }
      },
      date_of_birth: dateOfBirthSchema
    },
    ['body']
  )
);

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        custom: {
          options: async (value: string, { req }) => {
            try {
              const accessToken = (value || '').split(' ')[1];

              //check token is not empty
              if (!accessToken) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }

              //verify token
              const decoded_authorization = await verifyToken({
                token: accessToken,
                secretOrPublicKey: process.env.PRIVATE_KEY_ACCESS_TOKEN as string
              });

              (req as Request).decoded_authorization = decoded_authorization;
              return true;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                });
              }

              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: (error as ErrorWithStatus).message
              });
            }
          }
        }
      }
    },
    ['headers']
  )
);

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        custom: {
          options: async (value, { req }) => {
            try {
              //check refresh token is empty or not
              if (!value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }

              //check type of refresh token
              if (typeof value !== 'string') {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.REFRESH_TOKEN_IS_INVALID,
                  status: HTTP_STATUS.UNAUTHORIZED
                });
              }

              const [decoded_refresh_token, refresh_token] = await Promise.all([
                verifyToken({
                  token: value,
                  secretOrPublicKey: process.env.PRIVATE_KEY_REFRESH_TOKEN as string
                }),
                databaseService.refreshToken.findOne({ token: value })
              ]);

              //check token is existed in DB
              if (!refresh_token) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: USERS_MESSAGES.USED_REFRESH_TOKEN_OR_NOT_EXIST
                });
              }

              (req as Request).decoded_refresh_token = decoded_refresh_token;
              return true;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.UNAUTHORIZED,
                  message: capitalize(error.message)
                });
              }

              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: (error as ErrorWithStatus).message
              });
            }
          }
        }
      }
    },
    ['body']
  )
);

export const emailTokenVerifyValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        trim: true,
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED,
                  status: HTTP_STATUS.NOT_FOUND
                });
              }

              const decoded_email_verify = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.PRIVATE_KEY_EMAIL_VERIFY_TOKEN as string
              });

              (req as Request).decoded_email_verify = decoded_email_verify;

              return true;
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.NOT_FOUND,
                  message: capitalize(error.message)
                });
              }

              if (error instanceof ErrorWithStatus) {
                throw error;
              }

              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: (error as any).message
              });
            }
          }
        }
      }
    },
    ['body']
  )
);

export const emailValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value
            });

            if (!user) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.UNAUTHORIZED,
                message: USERS_MESSAGES.USER_NOT_FOUND
              });
            }

            req.user = user;
            return true;
          }
        }
      }
    },
    ['body']
  )
);

export const forgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: {
        custom: {
          options: async (value, { req }) => {
            try {
              if (!value) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.NOT_FOUND,
                  message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
                });
              }

              const decoded_forgot_password_token = await verifyToken({
                token: value,
                secretOrPublicKey: process.env.PRIVATE_KEY_FORGOT_PASSWORD_TOKEN as string
              });

              const { user_id } = decoded_forgot_password_token;

              const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });

              if (!user) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.USER_NOT_FOUND,
                  status: HTTP_STATUS.NOT_FOUND
                });
              }

              if (user.forgot_password_token !== value) {
                throw new ErrorWithStatus({
                  message: USERS_MESSAGES.INVALID_FORGOT_PASSWORD_TOKEN,
                  status: HTTP_STATUS.NOT_FOUND
                });
              }
            } catch (error) {
              if (error instanceof JsonWebTokenError) {
                throw new ErrorWithStatus({
                  status: HTTP_STATUS.BAD_REQUEST,
                  message: capitalize(error.message)
                });
              }

              if (error instanceof ErrorWithStatus) {
                throw error;
              }

              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: (error as any).message
              });
            }
          }
        }
      }
    },
    ['body']
  )
);

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: passwordSchema,
      confirm_password: confirmPasswordSchema,
      forgot_password_token: forgotPasswordTokenSchema
    },
    ['body']
  )
);

export const verifiedUserValidator = (req: Request, res: Response, next: NextFunction) => {
  const { verify } = req.decoded_authorization as TokenPayload; //Cách này vãn chưa tối ưu về mặt trải nghiệm người dùng, nên dùng websocket để bắn noti về client để client lấy acceccToken mới nhất chứa trạng thái verify mới nhất

  if (verify === UserVerifyStatus.Unverified) {
    return next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDEN
      })
    );
  }

  return next();
};

export const updateMeValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        ...nameSchema,
        notEmpty: undefined
      },
      date_of_birth: dateOfBirthSchema,
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_LENGTH
        },
        trim: true,
        isLength: {
          errorMessage: USERS_MESSAGES.BIO_LENGTH,
          options: {
            min: 1,
            max: 200
          }
        }
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH,
          options: {
            min: 1,
            max: 200
          }
        }
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH,
          options: {
            min: 1,
            max: 200
          }
        }
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_STRING
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            if (!REGEX_USERNAME.test(value)) {
              throw new Error(USERS_MESSAGES.USERNAME_INVALID);
            }

            const user = await databaseService.users.findOne({ username: value });

            if (user) {
              throw new Error(USERS_MESSAGES.USERNAME_EXISTED);
            }
            return true;
          }
        }
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH,
          options: {
            min: 1,
            max: 200
          }
        }
      },
      cover_photo: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.IMAGE_URL_MUST_BE_STRING
        },
        trim: true,
        isLength: {
          errorMessage: USERS_MESSAGES.IMAGE_URL_LENGTH,
          options: {
            min: 1,
            max: 200
          }
        }
      }
    },
    ['body']
  )
);

export const followUserValidator = validate(
  checkSchema(
    {
      followed_user_id: followedUserIdSchema
    },
    ['body']
  )
);

export const unfollowUserValidator = validate(
  checkSchema(
    {
      followedUserId: followedUserIdSchema
    },
    ['params']
  )
);

export const changePasswordValidator = validate(
  checkSchema(
    {
      old_password: {
        ...passwordSchema,
        custom: {
          options: async (value, { req }) => {
            const { user_id } = (req as Request).decoded_authorization as TokenPayload;

            const user = await databaseService.users.findOne({
              _id: new ObjectId(user_id),
              password: hashPassword(value)
            });

            if (!user) {
              throw new Error(USERS_MESSAGES.OLD_PASSWORD_NOT_MATCH);
            }

            return true;
          }
        }
      },
      new_password: passwordSchema
    },
    ['body']
  )
);

export const isUserLoggedInValidator =
  (middleware: (req: Request, res: Response, next: NextFunction) => void) =>
  (req: Request, res: Response, next: NextFunction) => {
    // req.header vs req.headers
    if (req.headers.authorization) {
      return middleware(req, res, next);
    }

    next();
  };

export const followValidator = validate(
  checkSchema(
    {
      page: {
        isNumeric: true,
        custom: {
          options: (value) => {
            if (value < 1) {
              throw new Error('page >= 1');
            }

            return true;
          }
        }
      },
      limit: {
        isNumeric: true,
        custom: {
          options: (value) => {
            if (value < 1 || value > 100) {
              throw new Error('1 <= limit <= 100');
            }

            return true;
          }
        }
      },
      user_id: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.USER_ID_MUST_BE_A_VALID_ID
        },
        custom: {
          options: async (value) => {
            if (!ObjectId.isValid(value) || typeof value !== 'string') {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: USERS_MESSAGES.USER_ID_MUST_BE_A_VALID_ID
              });
            }

            const user = await databaseService.users.findOne({ _id: new ObjectId(value) });

            if (!user || user.verify === UserVerifyStatus.Banned) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: USERS_MESSAGES.USER_NOT_FOUND
              });
            }

            return true;
          }
        }
      }
    },
    ['query']
  )
);
