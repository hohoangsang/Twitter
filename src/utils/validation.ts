import { NextFunction, Request, Response } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { RunnableValidationChains } from 'express-validator/src/middlewares/schema';
import { MediaType } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { Media } from '~/models/Other';
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

export function isMediaType(obj: any): obj is Media {
  return (
    typeof obj === 'object' &&
    typeof obj.url === 'string' &&
    Boolean(Object.values(MediaType).includes(obj.type))
  );
}
