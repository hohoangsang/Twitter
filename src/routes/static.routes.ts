import express from 'express';
import {
  serveImageController,
  serveM3u8Controller,
  serveSegmentController,
  serveVideoController,
  serveVideoStreamController
} from '~/controllers/medias.controllers';

const staticRoutes = express.Router();

staticRoutes.get('/image/:name', serveImageController);
staticRoutes.get('/video/:name', serveVideoController);
staticRoutes.get('/video-stream/:name', serveVideoStreamController);
staticRoutes.get('/video-hls/:id/master.m3u8', serveM3u8Controller);
staticRoutes.get('/video-hls/:id/:v/:segment', serveSegmentController);

export default staticRoutes;
