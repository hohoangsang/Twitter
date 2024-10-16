import express from 'express';
import {
  getStatusEncodeHlSController,
  uploadImagesController,
  uploadVideoController,
  uploadVideoHLSController
} from '~/controllers/medias.controller';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const mediasRouter = express.Router();

mediasRouter.post(
  '/upload-image',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadImagesController)
);

mediasRouter.post(
  '/upload-video',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoController)
);

mediasRouter.post(
  '/upload-video-hls',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(uploadVideoHLSController)
);

mediasRouter.get(
  '/upload-video-hls/status/:idName',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getStatusEncodeHlSController)
);

export default mediasRouter;
