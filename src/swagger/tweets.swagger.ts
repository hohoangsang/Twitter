import swaggerJSDoc from 'swagger-jsdoc';
import { TWEETS_MESSAGES } from '~/constants/message';

export const tweetsSwagger: Omit<swaggerJSDoc.SwaggerDefinition, 'info'> = {
  paths: {
    '/tweets': {
      post: {
        tags: ['Tweets'],
        description: 'Create tweet',
        operationId: 'createTweet',
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
                $ref: '#/components/schemas/CreateTweets'
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: TWEETS_MESSAGES.CREATE_TWEET_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Create tweet success'
                    },
                    result: {
                      $ref: '#/components/schemas/Tweet'
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
    },

    '/tweets/{tweet_id}': {
      get: {
        tags: ['Tweets'],
        description: 'Get tweet by Id',
        operationId: 'getTweetById',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'tweet_id',
            in: 'path',
            description: 'id of tweet',
            required: true,
            schema: {
              type: 'string',
              format: 'mongoId',
              example: '650089129421909718725135'
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
                      $ref: '#/components/schemas/Tweet'
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
    },

    '/tweets/{tweet_id}/childrens': {
      get: {
        tags: ['Tweets'],
        description: 'Get childrens by tweet id',
        operationId: 'getChildrenByTweetId',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'tweet_id',
            in: 'path',
            description: 'id of tweet',
            required: true,
            schema: {
              type: 'string',
              format: 'mongoId',
              example: '650089129421909718725135'
            }
          },
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
            name: 'type',
            in: 'query',
            description: 'type of tweet',
            required: true,
            schema: {
              type: 'string',
              enum: ['TWEET', 'RETWEET', 'COMMENT', 'QUOTETWEET']
            }
          }
        ],
        responses: {
          200: {
            description: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: TWEETS_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY
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
    },

    '/tweets/new-feeds/all': {
      get: {
        tags: ['Tweets'],
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
  },

  components: {
    schemas: {
      CreateTweets: {
        type: 'object',
        properties: {
          content: {
            type: 'string',
            example: 'This is my first tweet'
          },
          audience: {
            type: 'string',
            example: 'EVERYONE',
            $ref: '#/components/schemas/AudienceTypes'
          },
          medias: {
            type: 'array',
            items: {
              type: 'object',
              $ref: '#/components/schemas/Media'
            }
          },
          hashtags: {
            type: 'array',
            items: {
              type: 'string',
              example: '#example'
            }
          },
          mentions: {
            type: 'array',
            items: {
              type: 'string',
              example: '@example'
            }
          },
          parent_id: {
            type: 'string',
            example: '64822e655423935869645977'
          },
          type: {
            type: 'string',
            example: 'TWEET',
            enum: ['TWEET', 'RETWEET', 'COMMENT', 'QUOTETWEET']
          },
          user_id: {
            type: 'string',
            format: 'mongoId',
            example: '64822e655423935869645977'
          }
        }
      },
      Tweet: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            format: 'mongoId',
            example: '64822e655423935869645977'
          },
          user_id: {
            type: 'string',
            format: 'mongoId',
            example: '64822e655423935869645977'
          },
          content: {
            type: 'string',
            example: 'This is my first tweet'
          },
          audience: {
            type: 'string',
            example: 'EVERYONE',
            $ref: '#/components/schemas/AudienceTypes'
          },
          parent_id: {
            type: 'string',
            example: '64822e655423935869645977'
          },
          hashtags: {
            type: 'array',
            items: {
              type: 'string',
              example: '#example'
            }
          },
          mentions: {
            type: 'array',
            items: {
              type: 'string',
              example: '@example'
            }
          },
          medias: {
            type: 'array',
            items: {
              type: 'object',
              $ref: '#/components/schemas/Media'
            }
          },
          guest_views: {
            type: 'number',
            example: 100,
            minimum: 0
          },
          user_views: {
            type: 'number',
            example: 100,
            minimum: 0
          },
          created_at: {
            type: 'string',
            format: 'ISO8601',
            example: '2023-06-10T07:37:41.000Z'
          },
          updated_at: {
            type: 'string',
            format: 'ISO8601',
            example: '2023-06-10T07:37:41.000Z'
          }
        }
      }
    }
  }
};
