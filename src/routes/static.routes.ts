import express from 'express';
import { serveImageController, serveVideoController } from '~/controllers/medias.controller';

const staticRoutes = express.Router();

staticRoutes.get('/image/:name', serveImageController);
staticRoutes.get('/video/:name', serveVideoController);

export default staticRoutes;
