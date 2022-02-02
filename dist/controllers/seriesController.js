"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.series_post = exports.serieslist_get = void 0;
const express_validator_1 = require("express-validator");
const series_1 = __importDefault(require("../models/series"));
function serieslist_get(req, res) {
    const { seriesfilter } = req.query;
    series_1.default.find()
        .select('name notes')
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
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return res.status(400).json(errors);
    new series_1.default({
        name: req.body.name,
    }).save((saveError, series) => {
        if (saveError)
            return res.status(400).json({ saveError });
        return res.status(201).json({
            series: series,
            message: 'Successfully created series',
        });
    });
}
exports.series_post = series_post;
