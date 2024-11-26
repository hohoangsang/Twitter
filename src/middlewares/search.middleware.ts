import { checkSchema, ParamSchema } from 'express-validator';
import { PeopleSearchType, SearchType } from '~/constants/enum';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { TWEETS_MESSAGES } from '~/constants/message';
import { ErrorWithStatus } from '~/models/errors';
import { validate } from '~/utils/validation';

export const paginationSchema: Record<string, ParamSchema> = {
  page: {
    isNumeric: true,
    custom: {
      options: (value) => {
        const num = Number(value);

        if (num < 1) {
          throw Error('page >= 1');
        }

        return true;
      }
    }
  },
  limit: {
    isNumeric: true,
    custom: {
      options: (value) => {
        const num = Number(value);
        if (num > 100 || num < 1) {
          throw new Error('1 <= limit <= 100');
        }

        return true;
      }
    }
  }
};

export const searchValidator = validate(
  checkSchema(
    {
      type: {
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.TYPE_IS_REQUIRED
        },
        custom: {
          options: (values) => {
            if (Object.values(SearchType).includes(values)) {
              return true;
            }

            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: TWEETS_MESSAGES.INVALID_TYPE
            });
          }
        }
      },
      media: {
        optional: true,
        custom: {
          options: (values) => {
            if (['true', 'false'].includes(values)) {
              return true;
            }

            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: 'Invalid type of media'
            });
          }
        }
      },
      user: {
        optional: true,
        custom: {
          options: (values) => {
            if (['true', 'false'].includes(values)) {
              return true;
            }

            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: 'Invalid type of user'
            });
          }
        }
      },
      people: {
        optional: true,
        custom: {
          options: (values) => {
            if (Object.values(PeopleSearchType).includes(values)) {
              return true;
            }

            throw new ErrorWithStatus({
              status: HTTP_STATUS.BAD_REQUEST,
              message: 'Invalid people'
            });
          }
        }
      },
      searchString: {
        isString: {
          errorMessage: 'searchString must be a string'
        },
        notEmpty: {
          errorMessage: TWEETS_MESSAGES.SEARCH_STRING_NOT_EMPTY
        }
      },
      ...paginationSchema
    },
    ['query']
  )
);
