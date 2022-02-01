require('dotenv').config();
import streamifier from 'streamifier';
import { v4 as uuidv4 } from 'uuid';
import S3, {
  DeleteObjectRequest,
  GetObjectRequest,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

export function uploadFile(file: Express.Multer.File) {
  const fileStream = streamifier.createReadStream(file.buffer);

  const uploadParams: PutObjectRequest = {
    Bucket: bucketName as string,
    Body: fileStream,
    Key: uuidv4(),
  };

  return s3.upload(uploadParams).promise();
}

export function deleteFile(fileKey: string) {
  const deleteParams: DeleteObjectRequest = {
    Bucket: bucketName as string,
    Key: fileKey,
  };

  return s3.deleteObject(deleteParams).promise();
}

export function getFileStream(fileKey: string) {
  const getParams: GetObjectRequest = {
    Bucket: bucketName as string,
    Key: fileKey,
  };

  return s3.getObject(getParams).createReadStream();
}
