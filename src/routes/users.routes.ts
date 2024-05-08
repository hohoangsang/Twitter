import express from 'express';
import { loginController, registerController } from '~/controllers/users.controllers';
import { loginValidate, registerValidate } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const userRouter = express.Router();

userRouter.post('/login', loginValidate, loginController);
userRouter.post('/register', registerValidate, wrapRequestHandler(registerController));

export default userRouter;
