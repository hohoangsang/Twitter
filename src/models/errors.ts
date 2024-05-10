import { HTTP_STATUS } from '~/constants/httpStatus';
import { USERS_MESSAGES } from '~/constants/message';

type ErrorsType = Record<
  string,
  {
    msg: string;
    [key: string]: any;
  }
>;

export class ErrorWithStatus {
  status: number;
  message: string;

  constructor({ message, status }: { message: string; status: number }) {
    this.status = status;
    this.message = message;
  }
}

export class ErrorEntity extends ErrorWithStatus {
  errors: ErrorsType;

  constructor({
    message = USERS_MESSAGES.VALIDATION_ERROR,
    errors
  }: {
    message?: string;
    status?: number;
    errors: ErrorsType;
  }) {
    super({ message, status: HTTP_STATUS.UNPROCESSABLE_ENTITY });

    this.errors = errors;
  }
}
