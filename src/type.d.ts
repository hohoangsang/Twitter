import User from '~/models/schemas/user.schema';
import { Request } from 'express';
declare module 'express' {
  interface Request {
    user?: User;
  }
}
