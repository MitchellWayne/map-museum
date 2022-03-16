import * as express from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { deleteFile, getFileStream } from '../s3';

import Series from '../models/series';
import { SeriesInterface } from '../types';

import { processImage } from '../imageprocessor';

// TODO
// Extract Jimp image conversion and make standalone function
// Should return a promise

export function serieslist_get(req: express.Request, res: express.Response) {
  const { seriesfilter } = req.query;

  Series.find()
    .select('name description notes image mainImage') // mainimage here for testing only, need a series_get for detailed maybe
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

export async function series_post(req: express.Request, res: express.Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors);

  const imageData = [];
  const images = req.files as Array<Express.Multer.File>;

  if (images[0]) imageData.push(await processImage(images[0], true));
  if (images[1]) imageData.push(await processImage(images[1], false));

  const series = new Series({
    name: req.body.name,
    description: req.body.description,
    image: imageData[0] ? imageData[0].Key : null,
    mainImage: imageData[1] ? imageData[1].Key : null,
  });

  await series
    .save()
    .then((series: SeriesInterface) => {
      return res.status(201).json({
        series: series,
        message: 'Successfully created series',
        // uri: `${req.header('Host')}/series/${series._id}`,
      });
    })
    .catch((saveError: mongoose.Error) => {
      if (saveError) return res.status(400).json({ saveError });
    });
}

export async function series_put(req: express.Request, res: express.Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors);

  // Set target to series we are updating
  const targetSeries = await Series.findById(req.params.seriesID).exec();
  if (!targetSeries) return res.status(400).json({ err: 'series not found' });

  // Construct series object to use for update
  const series = {
    name: req.body.name,
    description: req.body.description,
    notes: targetSeries.notes,
  };

  const images = req.files as Array<Express.Multer.File>;

  // Icon
  if (images[0]) {
    if (targetSeries.image) deleteFile(targetSeries.image);
    const iconResult = await processImage(images[0], true);
    Object.assign(series, { image: iconResult.Key });
  }
  // Main Img
  if (images[1]) {
    if (targetSeries.mainImage) deleteFile(targetSeries.mainImage);
    const imgResult = await processImage(images[1], false);
    Object.assign(series, { mainImage: imgResult.Key });
  }

  Series.findByIdAndUpdate(
    req.params.seriesID,
    series,
    function (updateError: mongoose.Document, updatedSeries: SeriesInterface) {
      if (updateError) return res.status(400).json(updateError);
      return res.status(200).json({
        message: 'Successfully updated series.',
        uri: `${req.header('Host')}/series/${updatedSeries._id}`,
      });
    }
  );
}

export function series_delete(req: express.Request, res: express.Response) {
  // Delete image first
  // Series.findById(
  //   req.params.seriesID,
  //   function (findError: mongoose.Document, series: SeriesInterface) {
  //     if (findError) return res.status(400).json(findError);
  //     if (series.image) deleteFile(series.image);
  //   }
  // );

  Series.findOneAndDelete(
    {
      $and: [
        { _id: { $eq: req.params.seriesID } },
        { name: { $exists: true } },
        { notes: { $size: 0 } },
      ],
    },
    async function (delError: mongoose.Document, delSeries: SeriesInterface) {
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

      if (delSeries.image) await deleteFile(delSeries.image);
      if (delSeries.mainImage) await deleteFile(delSeries.mainImage);

      return res.status(200).json({
        message: `Successfully deleted series '${delSeries.name}' with id ${req.params.seriesID}`,
      });
    }
  );
}

export function seriesimage_get(req: express.Request, res: express.Response) {
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
}
