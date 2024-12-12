import { response } from 'express';
import { result } from 'lodash';
import { format } from 'path';
import swaggerJSDoc from 'swagger-jsdoc';
import { LIKE_MESSAGES, TWEETS_MESSAGES } from '~/constants/message';

export const likesSwagger: Omit<swaggerJSDoc.SwaggerDefinition, 'info'> = {
  paths: {
    '/likes': {
      post: {
        tags: ['Likes'],
        description: 'Like tweet',
        operationId: 'likeTweet',
        security: [
          {
            BearerAuth: []
          }
        ],
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  tweet_id: {
                    type: 'string',
                    example: '6473460162640640000'
                  }
                },
                required: ['tweet_id']
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: LIKE_MESSAGES.LIKE_SUCCESSFULLY,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: LIKE_MESSAGES.LIKE_SUCCESSFULLY
                    },
                    result: {
                      $ref: '#/components/schemas/Like'
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Internal server error'
          },
          400: {
            description: TWEETS_MESSAGES.TWEET_ID_MUST_BE_A_VALID_TWEET_ID
          },
          403: {
            description: 'Access denied'
          },
          404: {
            description: 'Not found'
          }
        }
      }
    },

    '/likes/tweet/{tweet_id}': {
      delete: {
        tags: ['Likes'],
        description: 'Unlike tweet',
        operationId: 'unlikeTweet',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'tweet_id',
            in: 'path',
            description: 'Id of tweet to unlike',
            required: true,
            schema: {
              type: 'string',
              format: 'MongoId',
              example: '6473460162640640000'
            }
          }
        ],
        responses: {
          200: {
            description: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: LIKE_MESSAGES.UNLIKE_SUCCESSFULLY
                    },
                    result: {
                      $ref: '#/components/schemas/Like'
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Internal server error'
          },
          400: {
            description: TWEETS_MESSAGES.TWEET_ID_MUST_BE_A_VALID_TWEET_ID
          },
          403: {
            description: 'Access denied'
          },
          404: {
            description: 'Not found'
          }
        }
      }
    }
  },

  components: {
    schemas: {
      Like: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            format: 'MongoId',
            example: '6473460162640640000'
          },
          tweet_id: {
            type: 'string',
            format: 'MongoId',
            example: '6473460162640640000'
          },
          user_id: {
            type: 'string',
            format: 'MongoId',
            example: '6473460162640640000'
          },
          created_at: {
            type: 'string',
            format: 'ISO8601',
            example: '2023-06-01T07:00:00.000Z'
          }
        }
      }
    }
  }
};
