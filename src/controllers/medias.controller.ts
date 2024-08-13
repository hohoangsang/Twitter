import { Request, Response } from 'express';
import path from 'path';
import mediaService from '~/services/medias.services';

export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediaService.processImages(req);

  return res.json({ message: 'Upload successfully', result });
};

export const serveSingleImage = (req: Request, res: Response) => {
  const name = req.params.name;

  res.sendFile(path.resolve('uploads', name), (err: Error) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};
