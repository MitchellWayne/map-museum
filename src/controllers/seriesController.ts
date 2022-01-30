import * as express from 'express';
import Series from '../models/series';

export function serieslist_get(req: express.Request, res: express.Response) {
  const seriesfilter = req.query;

  Series.find()
    .select('name notes')
    .exec(function (err, serieslist) {
      if (err) return res.status(400).json(err);
      else if (seriesfilter) {
        serieslist = serieslist.filter((series) =>
          series.name.toLowerCase().includes(seriesfilter)
        );
        return res.status(200).json(serieslist);
      } else return res.status(200).json(serieslist);
    });
}

export function series_post(req: express.Request, res: express.Response) {
  return res.status(404).json(req.body);
}
