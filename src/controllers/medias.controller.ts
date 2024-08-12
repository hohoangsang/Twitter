import { Request, Response } from 'express';
import path from 'path';
import { send } from 'process';
import mediaService from '~/services/medias.services';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const url = await mediaService.processSingleImage(req);

  return res.json({ message: 'Upload successfully', result: url });
};

export const serveSingleImage = (req: Request, res: Response) => {
  const name = req.params.name;

  res.sendFile(path.resolve('uploads', name), (err: Error) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};
