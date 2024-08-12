import express from 'express';
import { defaultErrorHandler } from '~/middlewares/errors.middleware';
import userRouter from '~/routes/users.routes';
import databaseService from '~/services/database.services';
import mediasRouter from '~/routes/medias.routes';
import { initFolder } from './utils/file';
import { config } from 'dotenv';

config();

const app = express();

databaseService.connect();

app.use(express.json());

const port = process.env.PORT || 4000;

//Tạo những folder cần thiết khi run server
initFolder();

app.use('/users', userRouter);
app.use('/medias', mediasRouter);

/**
 * Đây là error handler, bắt buộc phải được đặt ở vị trí cuối cùng sau những middleware function khác
 */
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
