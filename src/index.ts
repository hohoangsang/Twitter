import express from 'express';
import userRouter from '~/routes/users.routes';
import databaseService from '~/services/database.services';

const app = express();

databaseService.connect();

app.use(express.json());

const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/users', userRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
