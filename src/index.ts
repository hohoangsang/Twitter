import express, { ErrorRequestHandler, NextFunction, Request, Response } from 'express';
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
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(404).send({ message: err.message });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
