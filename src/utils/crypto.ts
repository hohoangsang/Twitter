import { createHash } from 'crypto';

const hash = (value: string) => {
  //Sử dụng createHash có sẵn của nodejs và dùng thuật toán sha256 để hash
  return createHash('sha256').update(value).digest('hex');
};

export const hashPassword = (value: string) => {
  return hash(value + process.env.PASSWORD_SECRET); 
};
