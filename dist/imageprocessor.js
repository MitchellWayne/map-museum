"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processImage = void 0;
const Jimp_1 = __importDefault(require("Jimp"));
const s3_1 = require("./s3");
function processImage(image, isIcon) {
    return __awaiter(this, void 0, void 0, function* () {
        const imgBuffer = image.buffer;
        yield Jimp_1.default.read(imgBuffer)
            .then((imageBuffer) => __awaiter(this, void 0, void 0, function* () {
            if (isIcon) {
                imageBuffer.cover(100, 100);
                imageBuffer.scaleToFit(100, 100);
            }
            else {
                imageBuffer.cover(800, 500);
                imageBuffer.scaleToFit(800, 500);
            }
            image.buffer = yield imageBuffer.getBufferAsync(Jimp_1.default.MIME_PNG);
        }))
            .catch(() => {
            return null;
        });
        const uploadedImage = yield (0, s3_1.uploadFile)(image);
        return uploadedImage;
    });
}
exports.processImage = processImage;