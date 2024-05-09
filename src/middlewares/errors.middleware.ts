import { NextFunction, Request, Response } from 'express';
import { omit } from 'lodash';
import { HTTP_STATUS } from '~/constants/httpStatus';

export const defaultErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('error from default', err);
  res.status(err.status || HTTP_STATUS.INTERNAL_SERVER_ERROR).send(omit(err, ['status']));
};
