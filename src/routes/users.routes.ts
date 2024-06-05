import express from 'express';
import {
  emailVerifyController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers';
import { filterMiddleware } from '~/middlewares/common.middleware';
import {
  accessTokenValidator,
  emailTokenVerifyValidator,
  emailValidator,
  forgotPasswordTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { updateMeReqBody } from '~/models/requests/users.requests';
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
 * Description: Verify email when user click the link in email to verify account
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

/**
 * Description: Resend email verify
 * Methods: post
 * Path: /resend-email-verify
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
userRouter.post(
  '/resend-email-verify',
  accessTokenValidator,
  wrapRequestHandler(resendVerifyEmailController)
);

/**
 * Description: Forgot password
 * Methods: post
 * Path: /forgot-password
 * Body: {
 *    email: string,
 * }
 */
userRouter.post('/forgot-password', emailValidator, wrapRequestHandler(forgotPasswordController));

/**
 * Description: Verify forgot password token
 * Methods: post
 * Path: /verify-forgot-password
 * Body: {
 *    forgot_password_token: string,
 * }
 */
userRouter.post(
  '/verify-forgot-password',
  forgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController)
);

/**
 * Description: Reset password
 * Methods: post
 * Path: /reset-password
 * Body: {
 *    password: string,
 *    confirm_password: string,
 *    forgot_password_token: string
 * }
 */
userRouter.post(
  '/reset-password',
  resetPasswordValidator,
  wrapRequestHandler(resetPasswordController)
);

/**
 * Description: Get profile
 * Methods: get
 * Path: /me
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));

/**
 * Description: Get profile
 * Methods: Get
 * Path: /:username
 */
userRouter.get('/:username', wrapRequestHandler(getProfileController));

/**
 * Description: Update profile
 * Methods: Patch
 * Path: /me
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 * Body: UserSchema
 */
userRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<updateMeReqBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateMeController)
);

export default userRouter;
