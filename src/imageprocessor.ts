import Jimp from 'Jimp';
import { uploadFile } from './s3';

export async function processImage(
  image: Express.Multer.File,
  isIcon: boolean
): Promise<string> {
  const imgBuffer = image.buffer;
  await Jimp.read(imgBuffer)
    .then(async (imageBuffer) => {
      if (isIcon) imageBuffer.cover(100, 100);
      else imageBuffer.cover(800, 500);
      image.buffer = await imageBuffer.getBufferAsync(Jimp.MIME_PNG);
    })
    .catch(() => {
      return null;
    });

  const uploadedImage = await uploadFile(image);
  return uploadedImage.Key;
}
