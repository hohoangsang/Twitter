import { config } from 'dotenv';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { TokenType, UserVerifyStatus } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import { RegisterReqBody, updateMeReqBody } from '~/models/requests/users.requests';
import Follower from '~/models/schemas/follower.schema';
import RefreshToken from '~/models/schemas/refreshToken.schema';
import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';
import { hashPassword } from '~/utils/crypto';
import { signToken } from '~/utils/jwt';

config();

class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.AccessToken,
        verify
      },
      privateKey: process.env.PRIVATE_KEY_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN
      }
    });
  }

  private signRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.RefreshToken,
        verify
      },
      privateKey: process.env.PRIVATE_KEY_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
      }
    });
  }

  private signEmailTokenVerify({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.EmailVerifyToken,
        verify
      },
      privateKey: process.env.PRIVATE_KEY_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN
      }
    });
  }

  private signForgotPasswordToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    return signToken({
      payload: {
        user_id,
        type: TokenType.ForgotPasswordToken,
        verify
      },
      privateKey: process.env.PRIVATE_KEY_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN
      }
    });
  }

  private signAccessAndRefreshToken({
    user_id,
    verify
  }: {
    user_id: string;
    verify: UserVerifyStatus;
  }) {
    if (!user_id)
      return Promise.reject({
        message: USERS_MESSAGES.USER_UNDEFINED,
        status: HTTP_STATUS.UNAUTHORIZED
      });

    return Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify })
    ]);
  }

  async register(body: RegisterReqBody) {
    const userId = new ObjectId();
    const email_verify_token = await this.signEmailTokenVerify({
      user_id: userId.toString(),
      verify: UserVerifyStatus.Unverified
    });
    const result = await databaseService.users.insertOne(
      new User({
        ...body,
        _id: userId,
        username: 'user' + userId.toString(),
        date_of_birth: new Date(body.date_of_birth),
        password: hashPassword(body.password),
        email_verify_token
      })
    );

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: userId.toString(),
      verify: UserVerifyStatus.Unverified
    });

    databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(userId) })
    );

    return {
      access_token,
      refresh_token
    };
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify });

    databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id: new ObjectId(user_id) })
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
      this.signAccessAndRefreshToken({ user_id: userId, verify: UserVerifyStatus.Verified }),
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
    const email_verify_token = await this.signEmailTokenVerify({
      user_id: userId,
      verify: UserVerifyStatus.Unverified
    });
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

  async forgotPassword({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const forgot_password_token = await this.signForgotPasswordToken({ user_id, verify });

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

  async getMe(user_id: string) {
    const result = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    );

    return result;
  }

  async getProfile(username: string) {
    const result = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          created_at: 0,
          updated_at: 0,
          verify: 0
        }
      }
    );

    if (!result) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: USERS_MESSAGES.USER_NOT_FOUND
      });
    }

    return result;
  }

  async updateMe({ body, user_id }: { body: updateMeReqBody; user_id: string }) {
    const _body = body.date_of_birth
      ? { ...body, date_of_birth: new Date(body.date_of_birth) }
      : body;

    const result = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...(_body as updateMeReqBody & { date_of_birth: Date })
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    );

    return {
      result,
      message: USERS_MESSAGES.UPDATE_ME_SUCCESS
    };
  }

  async followUser({ followed_user_id, user_id }: { user_id: string; followed_user_id: string }) {
    const follow = await databaseService.follower.findOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    });

    if (follow) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: USERS_MESSAGES.FOLLOWED
      });
    }

    await databaseService.follower.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    );

    return {
      message: USERS_MESSAGES.FOLLOW_SUCCESS
    };
  }

  async unfollowUser({ user_id, followed_user_id }: { user_id: string; followed_user_id: string }) {
    const follow = await databaseService.follower.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    });

    if (!follow) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED,
        status: HTTP_STATUS.BAD_REQUEST
      });
    }

    await databaseService.follower.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    });

    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS
    };
  }

  async changePassword({ new_password, user_id }: { user_id: string; new_password: string }) {
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      {
        $set: {
          password: hashPassword(new_password)
        },
        $currentDate: {
          updated_at: true
        }
      }
    );

    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
    };
  }
}

const usersService = new UsersService();

export default usersService;
