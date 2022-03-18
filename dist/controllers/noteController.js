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
exports.noteimage_get = exports.note_delete = exports.note_put = exports.note_post = exports.note_get = exports.notelistdetailed_get = exports.notelist_get = void 0;
const express_validator_1 = require("express-validator");
const s3_1 = require("../s3");
const note_1 = __importDefault(require("../models/note"));
const series_1 = __importDefault(require("../models/series"));
const imageprocessor_1 = require("../imageprocessor");
function updateSeries(noteID, seriesID, willPush) {
    return __awaiter(this, void 0, void 0, function* () {
        let updateArg;
        if (willPush)
            updateArg = { $push: { notes: noteID } };
        else
            updateArg = { $pull: { notes: noteID } };
        yield series_1.default.findByIdAndUpdate(seriesID, updateArg).catch((updateError) => {
            console.log(updateError);
            return false;
        });
        return true;
    });
}
function notelist_get(req, res) {
    const { seriesfilterID } = req.query;
    note_1.default.find()
        .select('series title latlong')
        .exec(function (err, notelist) {
        if (err)
            return res.status(400).json(err);
        else if (seriesfilterID) {
            notelist = notelist.filter((note) => note.series == seriesfilterID);
            return res.status(200).json(notelist);
        }
        else
            return res.status(200).json(notelist);
    });
}
exports.notelist_get = notelist_get;
function notelistdetailed_get(req, res) {
    const { seriesfilterID } = req.query;
    note_1.default.find().exec(function (err, notelist) {
        if (err)
            return res.status(400).json(err);
        else if (seriesfilterID) {
            notelist = notelist.filter((note) => note.series == seriesfilterID);
            return res.status(200).json(notelist);
        }
        else {
            return res.status(200).json(notelist);
        }
    });
}
exports.notelistdetailed_get = notelistdetailed_get;
function note_get(req, res) {
    note_1.default.findById(req.params.noteID).exec(function (err, note) {
        if (err)
            return res.status(400).json(err);
        else if (!note)
            return res
                .status(404)
                .json({ err: `note with id ${req.params.noteID} not found` });
        else
            return res.status(200).json(note);
    });
}
exports.note_get = note_get;
function note_post(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors);
        const imageData = [];
        const images = req.files;
        if (images[0])
            imageData.push(yield (0, imageprocessor_1.processImage)(images[0], false));
        if (images[1])
            imageData.push(yield (0, imageprocessor_1.processImage)(images[1], false));
        const note = new note_1.default({
            series: req.body.series,
            title: req.body.title,
            location: req.body.location,
            synopsis: req.body.synopsis,
            locdetails: req.body.locdetails,
            latlong: req.body.latlong,
            image: imageData[0] ? imageData[0].Key : null,
            seriesimage: imageData[1] ? imageData[1].Key : null,
        });
        yield note.save().catch((saveError) => {
            return res.status(400).json({ saveError });
        });
        if (yield updateSeries(note._id, note.series, true)) {
            return res.status(201).json({
                message: `Successfully created note and appended to series of id '${note.series}'`,
                uri: `${req.header('Host')}/note/${note._id}`,
            });
        }
        else {
            return res.status(201).json({
                message: `Successfully created note but failed to save to Series with id '${note.series}'`,
                uri: `${req.header('Host')}/note/${note._id}`,
            });
        }
    });
}
exports.note_post = note_post;
function note_put(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty())
            return res.status(400).json(errors);
        const targetNote = yield note_1.default.findById(req.params.noteID).exec();
        if (!targetNote)
            return res.status(400).json({ err: 'note not found' });
        const note = {
            series: req.body.series,
            title: req.body.title,
            location: req.body.location,
            synopsis: req.body.synopsis,
            locdetails: req.body.locdetails,
        };
        const images = req.files;
        if (images[0]) {
            if (targetNote.image)
                (0, s3_1.deleteFile)(targetNote.image);
            const iconResult = yield (0, imageprocessor_1.processImage)(images[0], false);
            Object.assign(note, { image: iconResult.Key });
        }
        if (images[1]) {
            if (targetNote.seriesimage)
                (0, s3_1.deleteFile)(targetNote.seriesimage);
            const imgResult = yield (0, imageprocessor_1.processImage)(images[1], false);
            Object.assign(note, { seriesimage: imgResult.Key });
        }
        note_1.default.findByIdAndUpdate(req.params.noteID, note, function (updateError, updatedNote) {
            if (updateError)
                return res.status(400).json(updateError);
            return res.status(200).json({
                message: 'Successfully updated note.',
                uri: `${req.header('Host')}/note/${updatedNote._id}`,
            });
        });
    });
}
exports.note_put = note_put;
function note_delete(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const deletedNote = yield note_1.default.findByIdAndDelete(req.params.noteID).catch((delError) => {
            return res.status(400).json({ delError });
        });
        if (deletedNote.image)
            yield (0, s3_1.deleteFile)(deletedNote.image);
        if (deletedNote.seriesimage)
            yield (0, s3_1.deleteFile)(deletedNote.seriesimage);
        if (yield updateSeries(deletedNote._id, deletedNote.series, false)) {
            return res.status(201).json({
                message: `Successfully deleted note with id '${deletedNote._id}'`,
            });
        }
        else {
            return res.status(201).json({
                message: `Successfully deleted note with id '${deletedNote._id}' but failed to pull from Series with id '${deletedNote.series}'`,
            });
        }
    });
}
exports.note_delete = note_delete;
function noteimage_get(req, res) {
    const key = req.params.key;
    const readStream = (0, s3_1.getFileStream)(key);
    readStream.pipe(res);
}
exports.noteimage_get = noteimage_get;
