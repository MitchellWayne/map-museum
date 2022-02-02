import * as express from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';

import Series from '../models/series';
import { SeriesInterface } from '../types';

export function serieslist_get(req: express.Request, res: express.Response) {
  const { seriesfilter } = req.query;

  Series.find()
    .select('name notes')
    .exec(function (err, serieslist) {
      if (err) return res.status(400).json(err);
      if (seriesfilter) {
        serieslist = serieslist.filter((series) =>
          series.name.toLowerCase().includes(seriesfilter)
        );
      }
      return res.status(200).json(serieslist);
    });
}

export function series_post(req: express.Request, res: express.Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors);

  new Series({
    name: req.body.name,
  }).save((saveError: mongoose.Document, series: SeriesInterface) => {
    if (saveError) return res.status(400).json({ saveError });
    return res.status(201).json({
      series: series,
      message: 'Successfully created series',
      // uri: `${req.hostname}/series/${series._id}`,
    });
  });
}
