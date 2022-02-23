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
exports.seriesimage_get = exports.series_delete = exports.series_put = exports.series_post = exports.serieslist_get = void 0;
const express_validator_1 = require("express-validator");
const s3_1 = require("../s3");
const series_1 = __importDefault(require("../models/series"));
const jimp_1 = __importDefault(require("jimp"));
function serieslist_get(req, res) {
    const { seriesfilter } = req.query;
    series_1.default.find()
        .select('name description notes image mainImage')
        .exec(function (err, serieslist) {
        if (err)
            return res.status(400).json(err);
        if (seriesfilter) {
            serieslist = serieslist.filter((series) => series.name.toLowerCase().includes(seriesfilter));
        }
        return res.status(200).json(serieslist);
    });
}
exports.serieslist_get = serieslist_get;
function series_post(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors);
        let imageResult, mainImageResult = null;
        const images = req.files;
        if (images[0]) {
            const image = images[0].buffer;
            yield jimp_1.default.read(image)
                .then((image) => __awaiter(this, void 0, void 0, function* () {
                image.cover(100, 100);
                images[0].buffer = yield image.getBufferAsync(jimp_1.default.MIME_PNG);
            }))
                .catch((err) => {
                return res.status(400).json({ err });
            });
            imageResult = yield (0, s3_1.uploadFile)(images[0]);
        }
        if (images[1]) {
            const image = images[1].buffer;
            yield jimp_1.default.read(image)
                .then((image) => __awaiter(this, void 0, void 0, function* () {
                image.cover(800, 500);
                images[1].buffer = yield image.getBufferAsync(jimp_1.default.MIME_PNG);
            }))
                .catch((err) => {
                return res.status(400).json({ err });
            });
            mainImageResult = yield (0, s3_1.uploadFile)(images[1]);
        }
        const series = new series_1.default({
            name: req.body.name,
            description: req.body.description,
            image: imageResult ? imageResult.Key : null,
            mainImage: mainImageResult ? mainImageResult.Key : null,
        });
        yield series
            .save()
            .then((series) => {
            return res.status(201).json({
                series: series,
                message: 'Successfully created series',
            });
        })
            .catch((saveError) => {
            if (saveError)
                return res.status(400).json({ saveError });
        });
    });
}
exports.series_post = series_post;
function series_put(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors);
        const targetSeries = yield series_1.default.findById(req.params.seriesID).exec();
        if (!targetSeries)
            return res.status(400).json({ err: 'series not found' });
        const series = {
            name: req.body.name,
            description: req.body.description,
            notes: targetSeries.notes,
        };
        let imageResult, mainImageResult = null;
        const images = req.files;
        if (images[0]) {
            if (targetSeries.image)
                (0, s3_1.deleteFile)(targetSeries.image);
            const image = images[0].buffer;
            yield jimp_1.default.read(image)
                .then((image) => __awaiter(this, void 0, void 0, function* () {
                image.cover(100, 100);
                image.scaleToFit(100, 100);
                images[0].buffer = yield image.getBufferAsync(jimp_1.default.MIME_PNG);
            }))
                .catch((err) => {
                return res.status(400).json({ err });
            });
            imageResult = yield (0, s3_1.uploadFile)(images[0]);
            Object.assign(series, { image: imageResult.Key });
        }
        if (images[1]) {
            if (targetSeries.mainImage)
                (0, s3_1.deleteFile)(targetSeries.mainImage);
            const image = images[1].buffer;
            yield jimp_1.default.read(image)
                .then((image) => __awaiter(this, void 0, void 0, function* () {
                image.cover(800, 500);
                image.scaleToFit(800, 500);
                images[1].buffer = yield image.getBufferAsync(jimp_1.default.MIME_PNG);
            }))
                .catch((err) => {
                return res.status(400).json({ err });
            });
            mainImageResult = yield (0, s3_1.uploadFile)(images[1]);
            Object.assign(series, { mainImage: mainImageResult.Key });
        }
        series_1.default.findByIdAndUpdate(req.params.seriesID, series, function (updateError, updatedSeries) {
            if (updateError)
                return res.status(400).json(updateError);
            return res.status(200).json({
                message: 'Successfully updated series.',
                uri: `${req.header('Host')}/series/${updatedSeries._id}`,
            });
        });
    });
}
exports.series_put = series_put;
function series_delete(req, res) {
    series_1.default.findById(req.params.seriesID, function (findError, series) {
        if (findError)
            return res.status(400).json(findError);
        if (series.image)
            (0, s3_1.deleteFile)(series.image);
    });
    series_1.default.findOneAndDelete({
        $and: [
            { _id: { $eq: req.params.seriesID } },
            { name: { $exists: true } },
            { notes: { $size: 0 } },
        ],
    }, function (delError, delSeries) {
        return __awaiter(this, void 0, void 0, function* () {
            if (delError) {
                return res.status(400).json({
                    delError,
                });
            }
            if (!delSeries) {
                return res.status(400).json({
                    details: `Series with id '${req.params.seriesID}' DNE or its note array is not empty. Make sure to empty a series' note array before deleting it.`,
                });
            }
            if (delSeries.image)
                yield (0, s3_1.deleteFile)(delSeries.image);
            if (delSeries.mainImage)
                yield (0, s3_1.deleteFile)(delSeries.mainImage);
            return res.status(200).json({
                message: `Successfully deleted series '${delSeries.name}' with id ${req.params.seriesID}`,
            });
        });
    });
}
exports.series_delete = series_delete;
function seriesimage_get(req, res) {
    const key = req.params.key;
    const readStream = (0, s3_1.getFileStream)(key);
    readStream.pipe(res);
}
exports.seriesimage_get = seriesimage_get;
