import swaggerJSDoc from 'swagger-jsdoc';
import { USERS_MESSAGES } from '~/constants/message';

export const usersSwagger: Omit<swaggerJSDoc.SwaggerDefinition, 'info'> = {
  paths: {
    '/users/login': {
      post: {
        tags: ['Users'],
        description: 'Login vào hệ thống',
        operationId: 'loginUser',
        requestBody: {
          description: 'successful operation',
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
        tags: ['Users'],
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
      },

      patch: {
        tags: ['Users'],
        description: 'Cập nhật thông tin user',
        operationId: 'updateMe',
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
                $ref: '#/components/schemas/UpdateMe'
              }
            }
          },
          required: true
        },
        responses: {
          '200': {
            description: USERS_MESSAGES.UPDATE_ME_SUCCESS,
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
          }
        }
      }
    },

    '/users/register': {
      post: {
        tags: ['Users'],
        description: 'Đăng ký tài khoản',
        operationId: 'registerUser',
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Register'
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Register success',
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
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Register success'
                        },
                        result: {
                          $ref: '#/components/schemas/SuccessAuthentication'
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
          },
          422: {
            description: 'Email or password is incorrect'
          }
        }
      }
    },

    '/users/refresh-access-token': {
      post: {
        tags: ['Users'],
        description: 'Refresh access token',
        operationId: 'refreshAccessToken',
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/RefreshAccessToken'
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Refresh token success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Refresh token success'
                    },
                    result: {
                      type: 'object',
                      properties: {
                        message: {
                          type: 'string',
                          example: 'Refresh token success'
                        },
                        result: {
                          $ref: '#/components/schemas/SuccessAuthentication'
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

    '/users/logout': {
      post: {
        tags: ['Users'],
        description: 'Logout',
        operationId: 'logout',
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
                  refresh_token: {
                    type: 'string',
                    format: 'JWT token',
                    example:
                      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NjY4Y2YxMjE1MzE3MjQ1ZjNhYzE0ZCIsImlhdCI6MTY4NTQxNzM3OCwiZXhwIjoxNjg1NDIwOTc4fQ.K240V018m603z118329g3mM26669175882618329g3mM26669175882618329g3mM26669175882618329g3mM26669175882618329g3mM26669175882618329g3mM2'
                  }
                }
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Logout success'
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

    '/users/verify-email': {
      post: {
        tags: ['Users'],
        description: 'Verify email',
        operationId: 'verifyEmail',
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email_verify_token: {
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
            description: 'Verify email success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.EMAIL_VERIFY_SUCCESS
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
            description: USERS_MESSAGES.EMAIL_ALREADY_VERIFIED_BEFORE
          }
        }
      }
    },

    '/users/forgot-password': {
      post: {
        tags: ['Users'],
        description: 'Forgot password',
        operationId: 'forgotPassword',
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    example: 'sang2@gmail.com'
                  }
                }
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Check email to reset password',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Check email to reset password'
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
            description: USERS_MESSAGES.EMAIL_IS_REQUIRED
          }
        }
      }
    },

    '/users/verify-forgot-password': {
      post: {
        tags: ['Users'],
        description: 'Verify forgot password',
        operationId: 'verifyForgotPassword',
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  forgot_password_token: {
                    type: 'string',
                    format: 'token',
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
            description: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_SUCCESS
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
            description: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
          }
        }
      }
    },

    '/users/reset-password': {
      post: {
        tags: ['Users'],
        description: 'Reset password',
        operationId: 'resetPassword',
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json:': {
              schema: {
                $ref: '#/components/schemas/ResetPassword'
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.RESET_PASSWORD_SUCCESS
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
            description: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
          },
          422: {
            description: USERS_MESSAGES.PASSWORD_IS_REQUIRED
          }
        }
      }
    },

    '/users/change-password': {
      put: {
        tags: ['Users'],
        description: 'Change password',
        operationId: 'changePassword',
        security: [
          {
            bearerAuth: []
          }
        ],
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json:': {
              schema: {
                $ref: '#/components/schemas/ChangePassword'
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS
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
            description: USERS_MESSAGES.USER_NOT_FOUND
          }
        }
      }
    },

    '/users/{username}': {
      get: {
        tags: ['Users'],
        description: 'Get user by username',
        operationId: 'getUserByUsername',
        parameters: [
          {
            name: 'username',
            in: 'path',
            description: 'Username of user',
            required: true,
            schema: {
              type: 'string',
              example: 'sang2'
            }
          }
        ],
        responses: {
          200: {
            description: USERS_MESSAGES.GET_PROFILE_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.GET_PROFILE_SUCCESS
                    },
                    result: {
                      $ref: '#/components/schemas/User'
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
            description: USERS_MESSAGES.USER_NOT_FOUND
          }
        }
      }
    },

    '/users/follow-user': {
      post: {
        tags: ['Users'],
        description: 'Follow user',
        operationId: 'followUser',
        requestBody: {
          description: 'successful operation',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  followed_user_id: {
                    type: 'string',
                    example: '6522d65881321975a1664198'
                  }
                }
              }
            }
          },
          required: true
        },
        security: [
          {
            BearerAuth: []
          }
        ],
        responses: {
          200: {
            description: USERS_MESSAGES.FOLLOW_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.FOLLOW_SUCCESS
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
            description: USERS_MESSAGES.INVALID_USER_ID
          },
          403: {
            description: 'Access denied'
          },
          404: {
            description: USERS_MESSAGES.USER_NOT_FOUND
          },
          401: {
            description: USERS_MESSAGES.USER_NOT_FOUND
          }
        }
      }
    },

    '/users/unfollow-user/{followedUserId}': {
      delete: {
        tags: ['Users'],
        description: 'Unfollow user',
        operationId: 'unfollowUser',
        parameters: [
          {
            name: 'followedUserId',
            in: 'path',
            description: 'Id of user to unfollow',
            required: true,
            schema: {
              type: 'string',
              example: '6522d65881321975a1664198'
            }
          }
        ],
        security: [
          {
            BearerAuth: []
          }
        ],
        responses: {
          200: {
            description: USERS_MESSAGES.UNFOLLOW_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.UNFOLLOW_SUCCESS
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
            description: USERS_MESSAGES.ALREADY_UNFOLLOWED
          },
          403: {
            description: 'Access denied'
          },
          404: {
            description: USERS_MESSAGES.USER_NOT_FOUND
          },
          401: {
            description: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
          }
        }
      }
    },

    '/users/follow/following': {
      get: {
        tags: ['Users'],
        description: 'Get list following',
        operationId: 'getListFollowing',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            required: true,
            schema: {
              type: 'number',
              example: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of items per page',
            required: true,
            schema: {
              type: 'number',
              example: 10
            }
          },
          {
            name: 'user_id',
            in: 'query',
            description: 'Id of user',
            required: true,
            schema: {
              type: 'string',
              example: '6522d65881321975a1664198'
            }
          }
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.GET_FOLLOWING_SUCCESS
                    },
                    result: {
                      type: 'object',
                      properties: {
                        data: {
                          typetype: 'array',
                          items: {
                            $ref: '#/components/schemas/User'
                          }
                        },

                        pagination: {
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
          401: {
            description: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
          }
        }
      }
    },

    '/users/follow/follower': {
      get: {
        tags: ['Users'],
        description: 'Get list follower',
        operationId: 'getListFollower',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            required: true,
            schema: {
              type: 'number',
              example: 1
            }
          },
          {
            name: 'limit',
            in: 'query',
            description: 'Number of items per page',
            required: true,
            schema: {
              type: 'number',
              example: 10
            }
          },
          {
            name: 'user_id',
            in: 'query',
            description: 'Id of user',
            required: true,
            schema: {
              type: 'string',
              example: '6522d65881321975a1664198'
            }
          }
        ],
        responses: {
          200: {
            description: 'successful operation',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: USERS_MESSAGES.GET_FOLLOWER_SUCCESS
                    },
                    result: {
                      type: 'object',
                      properties: {
                        data: {
                          typetype: 'array',
                          items: {
                            $ref: '#/components/schemas/User'
                          }
                        },

                        pagination: {
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
          401: {
            description: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
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
            format: 'JWT token',
            example: '12asddafasdfasdf3'
          },
          refresh_token: {
            type: 'string',
            format: 'JWT token',
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
      },
      Register: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'SangDepTroai'
          },
          email: {
            type: 'string',
            example: 'sang2@gmail.com'
          },
          password: {
            type: 'string',
            example: 'Dueling@123'
          },
          confirm_password: {
            type: 'string',
            example: 'Dueling@123'
          },
          date_of_birth: {
            type: 'string',
            format: 'ISO8601',
            example: '1970-01-01T00:00:00.000Z'
          }
        },
        required: ['name', 'email', 'password', 'confirm_password', 'date_of_birth']
      },
      RefreshAccessToken: {
        type: 'object',
        properties: {
          refresh_token: {
            type: 'string',
            format: 'MongoId',
            example: '664e864cb4971145486d152d'
          }
        },
        required: ['refresh_token']
      },
      ResetPassword: {
        type: 'object',
        properties: {
          password: {
            type: 'string',
            example: '123'
          },
          confirm_password: {
            type: 'string',
            example: '123'
          },
          forgot_password_token: {
            type: 'string',
            example: '123'
          }
        },
        required: true
      },
      UpdateMe: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            example: 'SangDepTroai'
          },
          date_of_birth: {
            type: 'string',
            format: 'ISO8601',
            example: '1970-01-01T00:00:00.000Z'
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
            format: 'url',
            example: ''
          },
          username: {
            type: 'string',
            example: 'Sangdeeptroai123'
          },
          avatar: {
            type: 'string',
            format: 'url',
            example: 'http://localhost:4000/picture.jpg'
          },
          cover_photo: {
            type: 'string',
            format: 'url',
            example: 'http://localhost:4000/'
          }
        }
      },
      ChangePassword: {
        type: 'object',
        properties: {
          old_password: {
            type: 'string',
            example: '123'
          },
          new_password: {
            type: 'string',
            example: '123'
          }
        }
      }
    }
  }
};
