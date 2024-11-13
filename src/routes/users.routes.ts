import express from 'express';
import {
  changePasswordController,
  emailVerifyController,
  followUserController,
  forgotPasswordController,
  getFollowerController,
  getFollowingController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unfollowUserController,
  updateMeController,
  verifyForgotPasswordController
} from '~/controllers/users.controllers';
import { filterMiddleware } from '~/middlewares/common.middleware';
import {
  accessTokenValidator,
  changePasswordValidator,
  emailTokenVerifyValidator,
  emailValidator,
  followUserValidator,
  followValidator,
  forgotPasswordTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowUserValidator,
  updateMeValidator,
  verifiedUserValidator
} from '~/middlewares/users.middlewares';
import { updateMeReqBody } from '~/models/requests/user.requests';
import { wrapRequestHandler } from '~/utils/handlers';

const userRouter = express.Router();

/**
 * Description: Login user
 * Methods: POST
 * Path: /login
 * Body: {
 *    email: string,
 *    password: string
 * }
 */
userRouter.post('/login', loginValidator, wrapRequestHandler(loginController));

/**
 * Description: Login with google oauth
 * Methods: GET
 * Path: /oauth/google
 */
userRouter.get('/oauth/google', wrapRequestHandler(oauthController));

/**
 * Description: Register a new user
 * Methods: POST
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
 * Description: Refresh token
 * Methods: POST
 * Path: /refresh-access-token
 * Body: {
 *  refresh_token: string
 * }
 */

userRouter.post(
  '/refresh-access-token',
  refreshTokenValidator,
  wrapRequestHandler(refreshTokenController)
);

/**
 * Description: Logout user
 * Methods: POST
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
 * Methods: POST
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
 * Methods: POST
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
 * Methods: POST
 * Path: /forgot-password
 * Body: {
 *    email: string,
 * }
 */
userRouter.post('/forgot-password', emailValidator, wrapRequestHandler(forgotPasswordController));

/**
 * Description: Verify forgot password token
 * Methods: POST
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
 * Methods: POST
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
 * Methods: GET
 * Path: /me
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 */
userRouter.get('/me', accessTokenValidator, wrapRequestHandler(getMeController));

/**
 * Description: Get profile
 * Methods: GET
 * Path: /:username
 */
userRouter.get('/:username', wrapRequestHandler(getProfileController));

/**
 * Description: Update profile
 * Methods: PATCH
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

/**
 * Description: Follow user
 * Methods: POST
 * Path: /follow-user
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 * Body: {
 *    followed_user_id: string;
 * }
 */

userRouter.post(
  '/follow-user',
  accessTokenValidator,
  verifiedUserValidator,
  followUserValidator,
  wrapRequestHandler(followUserController)
);

/**
 * Description: UnFollow user
 * Methods: DELETE
 * Path: /unfollow-user
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 * params: {
 *    followedUserId: string;
 * }
 */

userRouter.delete(
  '/unfollow-user/:followedUserId',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowUserValidator,
  wrapRequestHandler(unfollowUserController)
);

/**
 * Description: Get list following
 * Methods: GET
 * Path: /follow/following
 * query: {
 *    page: number,
 *    limit: number,
 *    user_id: string
 * }
 */
userRouter.get('/follow/following', followValidator, wrapRequestHandler(getFollowingController));

/**
 * Description: Get list follower
 * Methods: GET
 * Path: /follow/follower
 * query: {
 *    page: number,
 *    limit: number,
 *    user_id: string
 * }
 */
userRouter.get('/follow/follower', followValidator, wrapRequestHandler(getFollowerController));

/**
 * Description: Change password
 * Methods: PATCH
 * Path: /change-password
 * Header: {
 *    Authorization: `Bearer ${access_token}`
 * }
 * Body: {
 *    old_password: string;
 *    new_password: string;
 * }
 */
userRouter.put(
  '/change-password',
  accessTokenValidator,
  verifiedUserValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
);

export default userRouter;
