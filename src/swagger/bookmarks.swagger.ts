import { response } from 'express';
import swaggerJSDoc from 'swagger-jsdoc';
import { BOOKMARK_MESSAGES, USERS_MESSAGES } from '~/constants/message';

export const bookmarksSwagger: Omit<swaggerJSDoc.SwaggerDefinition, 'info'> = {
  paths: {
    '/bookmarks': {
      post: {
        tags: ['bookmarks'],
        description: 'Bookmark tweet',
        operationId: 'bookmark',
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
                    example: ''
                  }
                }
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
                    },
                    result: {
                      $ref: '#/components/schemas/Bookmark'
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
          401: {
            description: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
          }
        }
      }
    },

    '/bookmarks/tweet/{tweet_id}': {
      delete: {
        tags: ['bookmarks'],
        description: 'Unbookmark tweet',
        operationId: 'unbookmark',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'tweet_id',
            in: 'path',
            description: 'Id of tweet to unbookmark',
            required: true,
            schema: {
              type: 'string',
              format: 'MongoId',
              example: '67166cdd21c45a9a8f845c6d'
            }
          }
        ],
        responses: {
          200: {
            description: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: BOOKMARK_MESSAGES.UNBOOKMARK_SUCCESSFULLY
                    },
                    result: {
                      $ref: '#/components/schemas/Bookmark'
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
          401: {
            description: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
          }
        }
      }
    }
  },

  components: {
    schemas: {
      Bookmark: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            format: 'MongoId',
            example: '675aa1eee9deee8bb7603a19'
          },
          tweet_id: {
            type: 'string',
            example: '67166cdd21c45a9a8f845c6d',
            format: 'MongoId'
          },
          user_id: {
            type: 'string',
            format: 'MongoId',
            example: '664e8c2f26cb8a8ee15fd43c'
          },
          created_at: {
            type: 'string',
            format: 'ISO8601',
            example: '2024-12-12T08:42:22.826Z'
          }
        }
      }
    }
  }
};
