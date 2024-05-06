import express from 'express';
import { loginController, registerController } from '~/controllers/users.controllers';
import { loginValidate } from '~/middlewares/users.middlewares';

const userRouter = express.Router();

userRouter.post('/login', loginValidate, loginController);
userRouter.post('/register', registerController);

export default userRouter;
