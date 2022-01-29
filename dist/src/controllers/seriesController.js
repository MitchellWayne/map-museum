"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Series = require('../models/series');
exports.serieslist_get = function (req, res) {
    const seriesfilter = req.query;
    Series.find()
        .select('name notes')
        .exec(function (err, serieslist) {
        if (err)
            return res.status(400).json(err);
        else if (seriesfilter) {
            serieslist = serieslist.filter(series => (series.name.toLowerCase()).includes(seriesfilter));
            return res.status(200).json(serieslist);
        }
        else
            return res.status(200).json(serieslist);
    });
};
exports.series_post = function (req, res) {
};
