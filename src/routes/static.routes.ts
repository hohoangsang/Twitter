import express from 'express';
import { serveSingleImage } from '~/controllers/medias.controller';

const staticRoutes = express.Router();

staticRoutes.get('/image/:name', serveSingleImage);

export default staticRoutes;
