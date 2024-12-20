import { resendVerifyEmailController } from './../controllers/users.controllers';
import axios from 'axios';
import { config } from 'dotenv';
import { ParamsDictionary } from 'express-serve-static-core';
import { Document, ObjectId } from 'mongodb';
import { TokenType, UserVerifyStatus } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import { RegisterReqBody, updateMeReqBody } from '~/models/requests/user.requests';
import Follower from '~/models/schemas/follower.schema';
import RefreshToken from '~/models/schemas/refreshToken.schema';
import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';
import { hashPassword } from '~/utils/crypto';
import { signToken, verifyToken } from '~/utils/jwt';

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

  private signRefreshToken({
    user_id,
    verify,
    exp
  }: {
    user_id: string;
    verify: UserVerifyStatus;
    exp?: number;
  }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          type: TokenType.RefreshToken,
          verify,
          exp
        },
        privateKey: process.env.PRIVATE_KEY_REFRESH_TOKEN as string
      });
    }
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

  private async getGoogleOAuthToken(code: string): Promise<{
    access_token: string;
    id_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
  }> {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SCECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    };

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return data;
  }

  private async getGoogleProfile({
    access_token,
    id_token
  }: {
    access_token: string;
    id_token: string;
  }): Promise<{
    id: string;
    email: string;
    verified_email: string;
    name: string;
    picture: string;
  }> {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      params: {
        access_token,
        alt: 'json'
      },
      headers: {
        Authorization: `Bearer ${id_token}`
      }
    });

    return data;
  }

  private async insertRefreshTokenToDB({
    refresh_token,
    user_id,
    exp,
    iat
  }: {
    refresh_token: string;
    user_id: ObjectId;
    exp: number;
    iat: number;
  }) {
    await databaseService.refreshToken.insertOne(
      new RefreshToken({ token: refresh_token, user_id, exp, iat })
    );
  }

  private async deleteRefreshTokenFromDB(token: string) {
    await databaseService.refreshToken.deleteOne({ token });
  }

  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.PRIVATE_KEY_REFRESH_TOKEN as string
    });
  }

  async register(body: RegisterReqBody) {
    const userId = new ObjectId();
    const email_verify_token = await this.signEmailTokenVerify({
      user_id: userId.toString(),
      verify: UserVerifyStatus.Unverified
    });

    await databaseService.users.insertOne(
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

    const { exp, iat } = await this.decodeRefreshToken(refresh_token);

    await this.insertRefreshTokenToDB({ refresh_token, user_id: new ObjectId(userId), exp, iat });

    return {
      access_token,
      refresh_token
    };
  }

  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({ user_id, verify });

    const { exp, iat } = await this.decodeRefreshToken(refresh_token);

    await this.insertRefreshTokenToDB({ refresh_token, user_id: new ObjectId(user_id), exp, iat });

    return {
      access_token,
      refresh_token
    };
  }

  async oauth(code: string) {
    const data = await this.getGoogleOAuthToken(code);

    const { access_token, id_token } = data;

    const profile = await this.getGoogleProfile({ access_token, id_token });

    if (!profile.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.USER_NOT_VERIFIED,
        status: HTTP_STATUS.FORBIDEN
      });
    }

    const user = await databaseService.users.findOne({ email: profile.email });

    //Nếu tìm thấy user trong db thì sign access_token refresh_token
    //Nếu không tìm thấy thì thêm profile vào trong db users với password random
    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2, 25);

      const userId = new ObjectId();

      const email_verify_token = await this.signEmailTokenVerify({
        user_id: userId.toString(),
        verify: UserVerifyStatus.Unverified
      });

      await databaseService.users.insertOne(
        new User({
          _id: userId,
          name: profile.name,
          username: 'user' + userId.toString(),
          email: profile.email,
          password: randomPassword,
          verify: UserVerifyStatus.Unverified,
          avatar: profile.picture,
          email_verify_token
        })
      );

      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: userId.toString(),
        verify: UserVerifyStatus.Unverified
      });

      const { exp, iat } = await this.decodeRefreshToken(refresh_token);

      await this.insertRefreshTokenToDB({ refresh_token, user_id: new ObjectId(userId), exp, iat });

      return {
        access_token,
        refresh_token,
        new_user: 1,
        verified: UserVerifyStatus.Unverified
      };
    } else {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify
      });

      const { exp, iat } = await this.decodeRefreshToken(refresh_token);

      await this.insertRefreshTokenToDB({ refresh_token, user_id: user._id, exp, iat });

      return {
        access_token,
        refresh_token,
        new_user: 0,
        verified: user.verify
      };
    }
  }

  async checkExistEmail(email: string) {
    const result = await databaseService.users.findOne({ email });
    return Boolean(result);
  }

  async refreshToken({
    user_id,
    refreshTokenReq,
    exp
  }: {
    user_id: string;
    refreshTokenReq: string;
    exp: number;
  }) {
    const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) });

    if (!user) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.INVALID_USER_ID,
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR
      });
    }

    const { verify, _id } = user;

    const access_token = await this.signAccessToken({ user_id: _id.toString(), verify });

    const refresh_token = await this.signRefreshToken({ user_id: _id.toString(), verify, exp });

    const decoded_refresh_token = await this.decodeRefreshToken(refresh_token);

    //delete old refresh_token and add new refresh_token into database
    await Promise.all([
      this.insertRefreshTokenToDB({
        refresh_token,
        user_id: _id,
        exp: decoded_refresh_token.exp,
        iat: decoded_refresh_token.iat
      }),
      this.deleteRefreshTokenFromDB(refreshTokenReq)
    ]);

    return {
      access_token,
      refresh_token
    };
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

    const { exp, iat } = await this.decodeRefreshToken(refresh_token);

    await this.insertRefreshTokenToDB({ refresh_token, user_id: new ObjectId(userId), exp, iat });

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
    const follow = await databaseService.followers.findOne({
      followed_user_id: new ObjectId(followed_user_id),
      user_id: new ObjectId(user_id)
    });

    if (follow) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.BAD_REQUEST,
        message: USERS_MESSAGES.FOLLOWED
      });
    }

    await databaseService.followers.insertOne(
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
    const follow = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    });

    if (!follow) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED,
        status: HTTP_STATUS.BAD_REQUEST
      });
    }

    await databaseService.followers.deleteOne({
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

  async getFollowing({ limit, page, user_id }: { page?: number; limit?: number; user_id: string }) {
    const aggregateGetFollowing: Document[] = [
      {
        $match: {
          user_id: new ObjectId(user_id)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'followed_user_id',
          foreignField: '_id',
          as: 'followed_user'
        }
      },
      {
        $addFields: {
          user: {
            $map: {
              input: '$user',
              in: {
                _id: '$$this._id',
                name: '$$this.name',
                username: '$$this.username',
                avatar: '$$this.avatar'
              }
            }
          },
          followed_user: {
            $map: {
              input: '$followed_user',
              in: {
                _id: '$$this._id',
                name: '$$this.name',
                username: '$$this.username',
                avatar: '$$this.avatar'
              }
            }
          }
        }
      },
      {
        $addFields: {
          user: {
            $arrayElemAt: ['$user', 0]
          },
          followed_user: {
            $arrayElemAt: ['$followed_user', 0]
          }
        }
      }
    ];

    if (page && limit) {
      aggregateGetFollowing.push(
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      );
    }

    const result = await databaseService.followers
      .aggregate<Follower>(aggregateGetFollowing)
      .toArray();

    const total = await databaseService.followers.countDocuments({
      user_id: new ObjectId(user_id)
    });

    return {
      result,
      total
    };
  }

  async getFollower({ limit, page, user_id }: { page?: number; limit?: number; user_id: string }) {
    const aggregateGetFollower: Document[] = [
      {
        $match: {
          followed_user_id: new ObjectId(user_id)
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'followed_user_id',
          foreignField: '_id',
          as: 'followed_user'
        }
      },
      {
        $addFields: {
          user: {
            $map: {
              input: '$user',
              in: {
                _id: '$$this._id',
                name: '$$this.name',
                username: '$$this.username',
                avatar: '$$this.avatar'
              }
            }
          },
          followed_user: {
            $map: {
              input: '$followed_user',
              in: {
                _id: '$$this._id',
                name: '$$this.name',
                username: '$$this.username',
                avatar: '$$this.avatar'
              }
            }
          }
        }
      },
      {
        $addFields: {
          user: {
            $arrayElemAt: ['$user', 0]
          },
          followed_user: {
            $arrayElemAt: ['$followed_user', 0]
          }
        }
      }
    ];

    if (page && limit) {
      aggregateGetFollower.push(
        {
          $skip: limit * (page - 1)
        },
        {
          $limit: limit
        }
      );
    }

    const result = await databaseService.followers
      .aggregate<Follower>(aggregateGetFollower)
      .toArray();

    const total = await databaseService.followers.countDocuments({
      followed_user_id: new ObjectId(user_id)
    });

    return {
      result,
      total
    };
  }
}

const usersService = new UsersService();

export default usersService;
