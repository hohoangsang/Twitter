import express from 'express';
import { uploadSingleImageController } from '~/controllers/medias.controller';

const mediasRouter = express.Router();

mediasRouter.post('/upload-image', uploadSingleImageController);

export default mediasRouter;
