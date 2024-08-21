import { Request, Response } from 'express';
import path from 'path';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir';
import mediaService from '~/services/medias.services';

export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediaService.processImages(req);

  return res.json({ message: 'Upload successfully', result });
};

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediaService.processVideo(req);

  return res.json({ message: 'Upload successfuly', result });
};

export const serveImageController = (req: Request, res: Response) => {
  const name = req.params.name;

  res.sendFile(path.resolve(UPLOAD_IMAGE_DIR, name), (err: Error) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};

export const serveVideoController = (req: Request, res: Response) => {
  const name = req.params.name;

  res.sendFile(path.resolve(UPLOAD_VIDEO_TEMP_DIR, name), (err: Error) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};
