import express from 'express';
import { uploadImagesController } from '~/controllers/medias.controller';
import { wrapRequestHandler } from '~/utils/handlers';

const mediasRouter = express.Router();

mediasRouter.post('/upload-image', wrapRequestHandler(uploadImagesController));

export default mediasRouter;
