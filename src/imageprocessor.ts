import Jimp from 'Jimp';
import { uploadFile } from './s3';

export async function processImages(
  images: Express.Multer.File[],
  isIcon: boolean
): Promise<string[]> {
  const keys: string[] = [];
  images.forEach(async (image) => {
    const imgBuffer = image.buffer;
    Jimp.read(imgBuffer)
      .then(async (imageBuffer) => {
        if (isIcon) imageBuffer.cover(100, 100);
        else imageBuffer.cover(800, 500);
        image.buffer = await imageBuffer.getBufferAsync(Jimp.MIME_PNG);
      })
      .catch(() => {
        return [];
      });

    const imageKey = await uploadFile(image);
    keys.push(imageKey.Key);
  });
  return keys;
}
