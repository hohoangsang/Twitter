import { config } from 'dotenv';
import jwt, { SignOptions } from 'jsonwebtoken';
import { TokenPayload } from '~/models/requests/user.requests';

config();

export const signToken = ({
  payload,
  privateKey,
  options
}: {
  payload: string | object | Buffer;
  privateKey: string;
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
  secretOrPublicKey
}: {
  token: string;
  secretOrPublicKey: string;
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
