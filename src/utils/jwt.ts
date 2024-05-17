import { config } from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import { TokenPayload } from '~/models/requests/users.requests';

config();

export const signToken = ({
  payload,
  privateKey = process.env.PRIVATE_KEY as string,
  options
}: {
  payload: string | object | Buffer;
  privateKey?: string;
  options?: SignOptions;
}) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, privateKey, { algorithm: 'HS256', ...options }, function (err, token) {
      if (err) {
        reject(err);
      } else {
        resolve(token as string);
      }
    });
  });
};

export const verifyToken = ({
  token,
  secretOrPublicKey = process.env.PRIVATE_KEY
}: {
  token: string;
  secretOrPublicKey?: string;
}) => {
  return new Promise<TokenPayload>((resolve, reject) => {
    jwt.verify(token, secretOrPublicKey as string, function (err, decoded) {
      if (err) {
        throw reject(err);
      } else {
        resolve(decoded as TokenPayload);
      }
    });
  });
};
