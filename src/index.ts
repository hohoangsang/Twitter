import express from 'express';
import { defaultErrorHandler } from '~/middlewares/errors.middleware';
import userRouter from '~/routes/users.routes';
import databaseService from '~/services/database.services';

const app = express();

databaseService.connect();

app.use(express.json());

const port = 3000;

app.use('/users', userRouter);

/**
 * Đây là error handler, bắt buộc phải được đặt ở vị trí cuối cùng sau những middleware function khác
 */
app.use(defaultErrorHandler);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
