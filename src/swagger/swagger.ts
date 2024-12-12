import swaggerJSDoc from 'swagger-jsdoc';
import { usersSwagger } from './users.swagger';
import { bookmarksSwagger } from './bookmarks.swagger';
import { likesSwagger } from './likes.swagger';

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
      }
    ],

    paths: {
      ...usersSwagger.paths,
      ...bookmarksSwagger.paths,
      ...likesSwagger.paths
    },

    components: {
      schemas: {
        ...usersSwagger.components.schemas,
        ...bookmarksSwagger.components.schemas,
        ...likesSwagger.components.schemas
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
