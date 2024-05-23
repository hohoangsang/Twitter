import express from 'express';
import {
  emailVerifyController,
  loginController,
  logoutController,
  registerController
} from '~/controllers/users.controllers';
import {
  accessTokenValidator,
  emailTokenVerifyValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const userRouter = express.Router();

/**
 * Description: Login user
 * Methods: post
 * Path: /login
 * Body: {
 *    email: string,
 *    password: string
 * }
 */
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

/**
 * Description: Register a new user
 * Methods: post
 * Path: /register
 * Body: {
 *    email: string,
 *    password: string,
 *    confirm_password: string,
 *    name: string,
 *    date_of_birth: Date
 * }
 */
userRouter.post('/register', registerValidator, wrapRequestHandler(registerController));

/**
 * Description: Logout user
 * Methods: post
 * Path: /logout
 * Body: {
 *    refresh_token: string,
 * }
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
userRouter.post(
  '/logout',
  accessTokenValidator,
  refreshTokenValidator,
  wrapRequestHandler(logoutController)
);

/**
 * Description: Verify email
 * Methods: post
 * Path: /verify-email
 * Body: {
 *    email_verify_token: string,
 * }
 */
userRouter.post(
  '/verify-email',
  emailTokenVerifyValidator,
  wrapRequestHandler(emailVerifyController)
);

export default userRouter;
