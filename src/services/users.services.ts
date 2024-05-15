import { config } from 'dotenv';
import { ParamsDictionary } from 'express-serve-static-core';
import { ObjectId } from 'mongodb';
import { TokenType } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import RefreshToken from '~/models/schemas/refreshToken.schema';
import User from '~/models/schemas/user.schema';
import { RegisterBody } from '~/models/users/register';
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
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN
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

  async register(body: RegisterBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...body,
        date_of_birth: new Date(body.date_of_birth),
        password: hashPassword(body.password)
      })
    );

    const userId = result.insertedId.toString();

    const [access_token, refresh_token] = await this.signAccessAndRefreshToken(userId);

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
}

const usersService = new UsersService();

export default usersService;
