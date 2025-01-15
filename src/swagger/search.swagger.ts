import swaggerJSDoc from 'swagger-jsdoc';
import { TWEETS_MESSAGES } from '~/constants/message';

export const searchSwagger: Omit<swaggerJSDoc.SwaggerDefinition, 'info'> = {
  paths: {
    '/search/tweets': {
      get: {
        tags: ['Search'],
        description: 'Get new feeds',
        operationId: 'getNewFeeds',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            required: true,
            schema: {
              type: 'number',
              example: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            required: true,
            schema: {
              type: 'number',
              example: 10
            }
          },
          {
            name: 'searchString',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              example: 'example'
            }
          },
          {
            name: 'type',
            in: 'query',
            required: true,
            schema: {
              type: 'string',
              enum: ['HASHTAG', 'CONTENT'],
              example: 'CONTENT'
            }
          },
          {
            name: 'media',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['true', 'false']
            }
          },
          {
            name: 'media',
            in: 'query',
            schema: {
              type: 'string',
              enum: ['EVERYONE', 'FOLLOWING']
            }
          }
        ],
        responses: {
          200: {
            description: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: TWEETS_MESSAGES.GET_TWEET_SUCCESSFULLY
                    },
                    result: {
                      type: 'object',
                      properties: {
                        data: {
                          type: 'array',
                          items: {
                            $ref: '#/components/schemas/Tweet'
                          }
                        },
                        pagination: {
                          type: 'object',
                          $ref: '#/components/schemas/Pagination'
                        }
                      }
                    }
                  }
                }
              }
            }
          },
          500: {
            description: 'Internal server error'
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
  }
};
