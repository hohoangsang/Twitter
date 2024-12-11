import express from 'express';
import { defaultErrorHandler } from '~/middlewares/errors.middleware';
import userRouter from '~/routes/users.routes';
import databaseService from '~/services/database.services';
import mediasRouter from '~/routes/medias.routes';
import { initFolder } from '~/utils/file';
import { config } from 'dotenv';
import staticRoutes from '~/routes/static.routes';
import cors from 'cors';
import tweetRouter from '~/routes/tweets.routes';
import bookmarksRouter from '~/routes/bookmarks.routes';
import likesRouter from './routes/likes.routes';
import searchRouter from './routes/search.routes';
import YAML from 'yaml';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';

// /**
//  * Import script để tạo tự động nhiều data vào trong MongoDB,
//  * nhưng khi thì cần mới nên dùng, còn không cần thì comment đoạn import này
//  * vì mỗi khi server chạy lại thì đoạn script này sẽ chạy lại rất mất tgian
//  */
// import '~/utils/fake';

// const file = fs.readFileSync(path.resolve('swagger/swagger.yaml'), 'utf8');
// const swaggerDocument = YAML.parse(file);

const options: swaggerJsdoc.Options = {
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
    ]
  },

  apis: ['./swagger/swagger.yaml', './swagger/components.yaml']
};

const openapiSpecification = swaggerJsdoc(options);

config();

const app = express();

databaseService.connect().then(() => {
  databaseService.indexUsers();
  databaseService.indexRefreshTokens();
  databaseService.indexFollowers();
  databaseService.indexVideoStatus();
  databaseService.indexHashtags();
  databaseService.indexBookmark();
  databaseService.indexLike();
  databaseService.indexTweet();
});

app.use(express.json());

const port = process.env.PORT || 4000;

//Tạo những folder cần thiết khi run server
initFolder();

app.use(cors());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpecification));
app.use('/users', userRouter);
app.use('/medias', mediasRouter);
app.use('/static', staticRoutes);
app.use('/tweets', tweetRouter);
app.use('/bookmarks', bookmarksRouter);
app.use('/likes', likesRouter);
app.use('/search', searchRouter);
// app.use('/static/video-stream', express.static(UPLOAD_VIDEO_DIR));

/**
 * Đây là error handler, bắt buộc phải được đặt ở vị trí cuối cùng sau những middleware function khác
 */
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
