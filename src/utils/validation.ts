import { NextFunction, Request, Response } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { ErrorEntity, ErrorWithStatus } from '~/models/errors';

export const validate = (validation: RunnableValidationChains<ValidationChain>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await validation.run(req);

    const errors = validationResult(req);

    if (errors.isEmpty()) {
      return next();
    }

    const errorsObject = errors.mapped();
    const errorsEntity = new ErrorEntity({ errors: {} });

    for (const key in errorsObject) {
      const { msg } = errorsObject[key];

      if (msg instanceof ErrorWithStatus && msg.status !== HTTP_STATUS.UNPROCESSABLE_ENTITY) {
        return next(msg);
      }

      errorsEntity.errors[key] = errorsObject[key];
    }

    next(errorsEntity);
  };
};
