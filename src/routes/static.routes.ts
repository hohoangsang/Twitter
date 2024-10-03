import express from 'express';
import {
  serveImageController,
  serveM3u8Controller,
  serveVideoController,
  serveVideoStreamController
} from '~/controllers/medias.controller';

const staticRoutes = express.Router();

staticRoutes.get('/image/:name', serveImageController);
staticRoutes.get('/video/:name', serveVideoController);
staticRoutes.get('/video-stream/:name', serveVideoStreamController);
staticRoutes.get('/video-hls/:id', serveM3u8Controller);

export default staticRoutes;
