import { HTTP_STATUS } from '~/constants/httpStatus';

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
    message = 'Error Validate',
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
