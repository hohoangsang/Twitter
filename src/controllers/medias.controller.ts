import { Request, Response } from 'express';
import mediaService from '~/services/medias.services';
import { handleUploadSingleFile } from '~/utils/file';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediaService.processSingleImage(req);

  return res.json({ message: 'Upload successfully', result });
};
