import express from 'express';
import {
  serveImageController,
  serveVideoController,
  serveVideoStreamController
} from '~/controllers/medias.controller';

const staticRoutes = express.Router();

staticRoutes.get('/image/:name', serveImageController);
// staticRoutes.get('/video/:name', serveVideoController);
staticRoutes.get('/video-stream/:name', serveVideoStreamController);

export default staticRoutes;
