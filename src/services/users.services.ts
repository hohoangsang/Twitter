import { config } from 'dotenv';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { TokenType, UserVerifyStatus } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { RegisterReqBody } from '~/models/requests/users.requests';
import RefreshToken from '~/models/schemas/refreshToken.schema';
import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';
import { hashPassword } from '~/utils/crypto';
import { signToken } from '~/utils/jwt';

config();

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.AccessToken
      },
      privateKey: process.env.PRIVATE_KEY_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    });
  }

  private signRefreshToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.RefreshToken
      },
      privateKey: process.env.PRIVATE_KEY_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    });
  }

  private signEmailTokenVerify(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.EmailVerifyToken
      },
      privateKey: process.env.PRIVATE_KEY_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    });
  }

  private signForgotPasswordToken(user_id: string) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.ForgotPasswordToken
      },
      privateKey: process.env.PRIVATE_KEY_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    });
  }

  private signAccessAndRefreshToken(userId: string) {
    if (!userId)
      return Promise.reject({
        message: USERS_MESSAGES.USER_UNDEFINED,
        status: HTTP_STATUS.UNAUTHORIZED
      });

    return Promise.all([this.signAccessToken(userId), this.signRefreshToken(userId)]);
  }

  async register(body: RegisterReqBody) {
    const userId = new ObjectId();
    const email_verify_token = await this.signEmailTokenVerify(userId.toString());
    const result = await databaseService.users.insertOne(
      new User({
        ...body,
        _id: userId,
        date_of_birth: new Date(body.date_of_birth),
        password: hashPassword(body.password),
        email_verify_token
      })
    );

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(userId.toString());

    databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(userId) })
    );

    return {
      access_token,
      refresh_token
    };
  }

  async login(userId: string) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(userId);

    databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(userId) })
    );

    return {
      access_token,
      refresh_token
    };
  }

  async checkExistEmail(email: string) {
    const result = await databaseService.users.findOne({ email });
    return Boolean(result);
  }

  async logout(token: string) {
    await databaseService.refreshToken.deleteOne({ token });

    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS
    };
  }

  async verifyEmail(userId: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken(userId),
      databaseService.users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            updated_at: new Date(),
            email_verify_token: '',
            verify: UserVerifyStatus.Verified
          }
        }
      )
    ]);

    const [access_token, refresh_token] = token;

    return {
      access_token,
      refresh_token
    };
  }

  async resendVerifyEmail(userId: string) {
    const email_verify_token = await this.signEmailTokenVerify(userId);
    console.log('resend email', email_verify_token);

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(userId)
      },
      {
        $set: {
          email_verify_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    );

    return {
      message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESS
    };
  }

  async forgotPassword(user_id: string) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id);

    console.log('Send email to verify forgot password token', forgot_password_token);

    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          forgot_password_token
        },
        $currentDate: {
          updated_at: true
        }
      }
    );

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD
    };
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(password),
          forgot_password_token: ''
        },
        $currentDate: {
          updated_at: true
        }
      }
    );

    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
    };
  }
}

const usersService = new UsersService();

export default usersService;
