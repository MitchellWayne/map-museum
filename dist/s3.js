"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileStream = exports.deleteFile = exports.uploadFile = void 0;
require('dotenv').config();
const fs_1 = __importDefault(require("fs"));
const s3_1 = __importDefault(require("aws-sdk/clients/s3"));
const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;
const s3 = new s3_1.default({
    region,
    accessKeyId,
    secretAccessKey,
});
function uploadFile(file) {
    const fileStream = fs_1.default.createReadStream(file.path);
    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename,
    };
    return s3.upload(uploadParams).promise();
}
exports.uploadFile = uploadFile;
function deleteFile(fileKey) {
    const deleteParams = {
        Bucket: bucketName,
        Key: fileKey,
    };
    return s3.deleteObject(deleteParams).promise();
}
exports.deleteFile = deleteFile;
function getFileStream(fileKey) {
    const getParams = {
        Bucket: bucketName,
        Key: fileKey,
    };
    return s3.getObject(getParams).createReadStream();
}
exports.getFileStream = getFileStream;
