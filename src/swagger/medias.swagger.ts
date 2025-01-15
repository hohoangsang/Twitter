import swaggerJSDoc from 'swagger-jsdoc';
import { MEDIA_MESSAGES } from '~/constants/message';

export const mediasSwagger: Omit<swaggerJSDoc.SwaggerDefinition, 'info'> = {
  paths: {
    '/medias/upload-image': {
      post: {
        tags: ['Medias'],
        description: 'Upload image',
        operationId: 'uploadImage',
        security: [
          {
            BearerAuth: []
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Upload successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Upload successfully'
                    },
                    result: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          format: 'url',
                          example:
                            'https://res.cloudinary.com/dxxwcby8l/image/upload/v1694024511/twitter/1694024510373_1694024510373.jpg'
                        },
                        type: {
                          type: 'string',
                          example: 'IMAGE'
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

    '/medias/upload-video': {
      post: {
        tags: ['Medias'],
        description: 'Upload video',
        operationId: 'uploadVideo',
        security: [
          {
            BearerAuth: []
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  video: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Upload successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Upload successfully'
                    },
                    result: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          format: 'url',
                          example:
                            'https://res.cloudinary.com/dxxwcby8l/image/upload/v1694024511/twitter/1694024510373_1694024510373.jpg'
                        },
                        type: {
                          type: 'string',
                          example: 'VIDEO'
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

    '/medias/upload-video-hls': {
      post: {
        tags: ['Medias'],
        description: 'Upload video hls',
        operationId: 'uploadVideoHls',
        security: [
          {
            BearerAuth: []
          }
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  video: {
                    type: 'string',
                    format: 'binary'
                  }
                }
              }
            }
          },
          required: true
        },
        responses: {
          200: {
            description: 'Upload successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Upload successfully'
                    },
                    result: {
                      type: 'object',
                      properties: {
                        url: {
                          type: 'string',
                          format: 'url'
                        },
                        type: {
                          type: 'string',
                          example: 'HLS'
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
          400: {
            description: 'Bad request'
          }
        }
      }
    },

    '/medias/upload-video-hls/status/{idName}': {
      get: {
        tags: ['Medias'],
        description: 'Get status upload video hls',
        operationId: 'getStatusUploadVideoHls',
        security: [
          {
            BearerAuth: []
          }
        ],
        parameters: [
          {
            name: 'idName',
            in: 'path',
            description: 'id name',
            required: true,
            schema: {
              type: 'string',
              example: '1694024510373_1694024510373'
            }
          }
        ],
        responses: {
          200: {
            description: MEDIA_MESSAGES.GET_VIDEO_STATUS_SUCCESS,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: MEDIA_MESSAGES.GET_VIDEO_STATUS_SUCCESS
                    },
                    result: {
                      type: 'object',
                      properties: {
                        _id: {
                          type: 'string',
                          format: 'mongoId',
                          example: '653388488073451808a11061'
                        },
                        idName: {
                          type: 'string',
                          example: '1694024510373_1694024510373'
                        },
                        status: {
                          type: 'string',
                          enum: ['PENDING', 'ENCODING', 'COMPLETE', 'FAILED']
                        },
                        created_at: {
                          type: 'string',
                          format: 'ISO8601'
                        },
                        updated_at: {
                          type: 'string',
                          format: 'ISO8601'
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
          400: {
            description: 'Bad request'
          }
        }
      }
    }
  }
};
