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
      // uri: `${req.header('Host')}/series/${series._id}`,
    });
  });
}

export function series_delete(req: express.Request, res: express.Response) {
  Series.findOneAndDelete(
    {
      $and: [
        { _id: { $eq: req.params.seriesID } },
        { name: { $exists: true } },
        { notes: { $size: 0 } },
      ],
    },
    function (delError: mongoose.Document, delSeries: SeriesInterface) {
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
      return res.status(200).json({
        message: `Successfully deleted series '${delSeries.name}' with id ${req.params.seriesID}`,
      });
    }
  );
}
