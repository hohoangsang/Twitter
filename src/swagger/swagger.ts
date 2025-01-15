import swaggerJSDoc from 'swagger-jsdoc';
import { usersSwagger } from './users.swagger';
import { bookmarksSwagger } from './bookmarks.swagger';
import { likesSwagger } from './likes.swagger';
import { tweetsSwagger } from '~/swagger/tweets.swagger';
import { MediaType } from '~/constants/enum';
import { searchSwagger } from '~/swagger/search.swagger';
import { mediasSwagger } from '~/swagger/medias.swagger';

export const swaggerConfig: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Swagger X(Twitter) clone - OpenAPI 3.0',
      version: '1.0.1',
      description: 'This is a X(Twitter) clone Server based on the OpenAPI 3.0 specification',
      contact: {
        email: 'hoangsangho93@gmail.com'
      },
      license: {
        name: 'Apache 2.0',
        url: 'http://www.apache.org/licenses/LICENSE-2.0.html'
      }
    },

    externalDocs: {
      description: 'Find out more about Swagger',
      url: 'http://swagger.io'
    },

    servers: [
      {
        url: 'http://localhost:4000/'
      }
    ],

    tags: [
      {
        name: 'Users'
      },
      {
        name: 'Bookmarks'
      },
      {
        name: 'Likes'
      },
      {
        name: 'Tweets'
      },
      {
        name: 'Search'
      },
      {
        name: 'Medias'
      }
    ],

    paths: {
      ...usersSwagger.paths,
      ...bookmarksSwagger.paths,
      ...likesSwagger.paths,
      ...tweetsSwagger.paths,
      ...searchSwagger.paths,
      ...mediasSwagger.paths
    },

    components: {
      schemas: {
        ...usersSwagger.components.schemas,
        ...bookmarksSwagger.components.schemas,
        ...likesSwagger.components.schemas,
        ...tweetsSwagger.components.schemas,

        //Common
        Pagination: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              example: 10
            },
            page: {
              type: 'number',
              example: 1
            },
            total: {
              type: 'number',
              example: 10
            }
          }
        },
        MediaTypes: {
          type: 'enum',
          enum: ['IMAGE', 'VIDEO', 'HLS']
        },
        AudienceTypes: {
          type: 'enum',
          enum: ['EVERYONE', 'TWITTERCIRCLE']
        },
        Media: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              example: 'https://example.com/image.jpg'
            },
            type: {
              type: 'string',
              example: 'IMAGE',
              $ref: '#/components/schemas/MediaTypes'
            }
          }
        }
      },

      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },

  apis: []
};
