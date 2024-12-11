import { swaggerConfig } from '~/swagger/swagger';
import swaggerJSDoc from 'swagger-jsdoc';

export const userSwagger: Omit<swaggerJSDoc.SwaggerDefinition, 'info'> = {
  path: {
    '/users/login': {
      post: {
        tags: ['users'],
        description: 'Login vào hệ thống',
        operationId: 'loginUser',
        requestBody: {
          description: 'Update an existent pet in the store',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Login'
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Login success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Login success'
                    },
                    result: {
                      $ref: '#/components/schemas/SuccessAuthentication'
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
          },
          422: {
            description: 'Email or password is incorrect'
          }
        }
      }
    },
    '/users/me': {
      get: {
        tags: ['users'],
        // summary: "Lấy thông tin user's",
        description: 'Lấy thông tin user',
        operationId: 'getMe',
        security: [
          {
            BearerAuth: []
          }
        ],
        responses: {
          '200': {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/User'
                }
              }
            }
          },
          '500': {
            description: 'Internal server error'
          },
          '401': {
            description: 'Access token is required'
          },
          '403': {
            description: 'Access denied'
          },
          '404': {
            description: 'Not found'
          }
        }
      }
    }
  },

  components: {
    schemas: {
      Login: {
        type: 'object',
        properties: {
          email: {
            type: 'string',
            example: 'sang2@gmail.com'
          },
          password: {
            type: 'string',
            example: 'Dueling@123'
          }
        },
        required: ['email', 'password']
      },
      SuccessAuthentication: {
        type: 'object',
        properties: {
          access_token: {
            type: 'string',
            example: '12asddafasdfasdf3'
          },
          refresh_token: {
            type: 'string',
            example: 'afasdfawer12131fsd'
          }
        }
      },
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            format: 'MongoId',
            example: '664e8c2f26cb8a8ee15fd43c'
          },
          name: {
            type: 'string',
            example: 'SangDepTroai'
          },
          email: {
            type: 'string',
            example: 'sang2@gmail.com'
          },
          date_of_birth: {
            type: 'string',
            format: 'ISO8601',
            example: '1970-01-01T00:00:00.000Z'
          },
          created_at: {
            type: 'string',
            format: 'ISO8601',
            example: '2024-05-23T00:22:07.383Z'
          },
          updated_at: {
            type: 'string',
            format: 'ISO8601',
            example: '2024-06-06T08:07:03.221Z'
          },
          verify: {
            $ref: '#/components/schemas/UserVerifyStatus'
          },
          user_verify: {
            type: 'number',
            example: 1,
            enum: [0, 1, 2]
          },
          bio: {
            type: 'string',
            example: 'Tui la dev quen =))))'
          },
          location: {
            type: 'string',
            example: ''
          },
          website: {
            type: 'string',
            example: ''
          },
          username: {
            type: 'string',
            example: 'Sangdeeptroai123'
          },
          avatar: {
            type: 'string',
            example: 'http://localhost:4000/picture.jpg'
          },
          cover_photo: {
            type: 'string',
            example: 'http://localhost:4000/picture.jpg'
          },
          twitter_circle: {
            type: 'array',
            items: {
              type: 'string'
            },
            format: 'MongoId',
            example: ['672a429276c2116755257b04', '672a429276c2116755257b04']
          }
        }
      },
      UserVerifyStatus: {
        type: 'number',
        example: 1,
        enum: ['Unverified', 'Verified', 'Banned']
      }
    }
  }
};
