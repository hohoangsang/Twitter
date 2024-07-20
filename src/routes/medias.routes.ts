import express from 'express';
import { uploadSingleImageController } from '~/controllers/medias.controller';
import { wrapRequestHandler } from '~/utils/handlers';

const mediasRouter = express.Router();

mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController));

export default mediasRouter;
