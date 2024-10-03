import { NextFunction, Request, Response } from 'express';
import path from 'path';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from '~/constants/dir';
import { HTTP_STATUS } from '~/constants/httpStatus';
import mediaService from '~/services/medias.services';
import fs from 'fs';

export const uploadImagesController = async (req: Request, res: Response) => {
  const result = await mediaService.processImages(req);

  return res.json({ message: 'Upload successfully', result });
};

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediaService.processVideo(req);

  return res.json({ message: 'Upload successfuly', result });
};

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const result = await mediaService.processHLSVideo(req);

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

  res.sendFile(path.resolve(UPLOAD_VIDEO_DIR, name), (err: Error) => {
    if (err) {
      res.status((err as any).status).send('Not found');
    }
  });
};

export const serveVideoStreamController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const mime = (await import('mime')).default;

  const range = req.headers.range;
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).send('Requires Range header');
  }

  const { name } = req.params;
  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name);
  // 1MB = 10^6 bytes (Tính theo hệ 10, đây là thứ mà chúng ta hay thấy trên UI)
  // Còn nếu tính theo hệ nhị phân thì 1MB = 2^20 bytes (1024 * 1024)

  //Dung lượng video (bytes)
  const videoSize = fs.statSync(videoPath).size;

  //Dung lượng video cho mỗi phân đoạn stream
  const chunkSize = 30 * 10 ** 6; // 30 MB

  // Lấy giá trị byte bắt đầu từ header Range (vd: bytes=1048576-)
  const start = Number(range.replace(/\D/g, ''));

  //Lấy giá trị byte kết thúc, vượt quá dung lượng video thì lấy giá trị videoSize
  const end = Math.min(start + chunkSize, videoSize - 1);

  // Dung lượng thực tế cho mỗi đoạn video stream
  // Thường đây sẽ là chunkSize, ngoại trừ đoạn cuối cùng
  const contentLength = end - start + 1;
  const contentType = mime.getType(videoPath) || 'video/*';

  /**
   * Format của header Content-Range: bytes <start>-<end>/<videoSize>
   * Ví dụ: Content-Range bytes 1048576-3145727/3145728
   * Yêu cầu là 'end' phải luôn luôn nhỏ hơn 'videoSize'
   * 'Content-Range': 'bytes 0-100/100' ==> Lỗi
   * 'Content-Range': 'bytes 0-99/100'  ==> Đúng
   *
   * Còn Content-Length sẽ là end - start + 1. Đại diện cho khoản cách
   * Để dễ hình dung, hãy tưởng tượng tự số 0 đến số 10 thì ta có 11 số
   * byte cũng tượng tự, nếu start = 0, end = 10 thì ta có 11 byte,
   * Công thức là end - start + 1
   *
   * ChunkSize = 50
   * videoSize = 100
   * |0-----------50|51----------------99|100 (end)
   * stream 1: start = 0, end = 50, contentLength = 51
   * stream 2: start = 51, end = 99, contentLength = 49
   */

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  };
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers);
  const videoStreams = fs.createReadStream(videoPath, { start, end });
  videoStreams.pipe(res);
};

export const serveM3u8Controller = async (req: Request, res: Response) => {};
