import { NextFunction, Request, Response } from 'express';
import { pick } from 'lodash';

type FilterKeys<T> = Array<keyof T>;

export const filterMiddleware =
  <T>(filterKeys: FilterKeys<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    const filterBody = pick(req.body, filterKeys);

    req.body = filterBody;

    next();
  };
