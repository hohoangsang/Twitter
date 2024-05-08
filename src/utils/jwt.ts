import jwt, { SignOptions } from 'jsonwebtoken';

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
