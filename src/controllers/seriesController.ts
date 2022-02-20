import * as express from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { uploadFile, deleteFile, getFileStream } from '../s3';

import Series from '../models/series';
import { SeriesInterface } from '../types';

import Jimp from 'jimp';

// TODO
// Extract Jimp image conversion and make standalone function
// Should return a promise

export function serieslist_get(req: express.Request, res: express.Response) {
  const { seriesfilter } = req.query;

  Series.find()
    .select('name notes image mainImage') // mainimage here for testing only, need a series_get for detailed
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

  let imageResult,
    mainImageResult = null;

  const images = req.files as Array<Express.Multer.File>;

  // Tiny image icon for search result
  if (images[0]) {
    const image = images[0].buffer;
    await Jimp.read(image)
      .then(async (image) => {
        image.cover(100, 100);
        images[0].buffer = await image.getBufferAsync(Jimp.MIME_PNG);
      })
      .catch((err: Error) => {
        return res.status(400).json({ err });
      });

    imageResult = await uploadFile(images[0]);
  }

  // Large image for detailed series information
  if (images[1]) {
    const image = images[1].buffer;
    await Jimp.read(image)
      .then(async (image) => {
        image.cover(800, 500);
        images[1].buffer = await image.getBufferAsync(Jimp.MIME_PNG);
      })
      .catch((err: Error) => {
        return res.status(400).json({ err });
      });

    mainImageResult = await uploadFile(images[1]);
  }

  const series = new Series({
    name: req.body.name,
    image: imageResult ? imageResult.Key : null,
    mainImage: mainImageResult ? mainImageResult.Key : null,
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

  const series = new Series({
    _id: req.params.seriesID,
    name: req.body.name,
  });

  let imageResult,
    mainImageResult = null;

  const images = req.files as Array<Express.Multer.File>;

  // Tiny image icon for search result
  if (images[0]) {
    // Delete old image then concat new s3 key to updating series obj
    Series.findById(
      req.params.seriesID,
      function (findError: mongoose.Document, series: SeriesInterface) {
        if (findError) return res.status(400).json(findError);
        if (series.image) deleteFile(series.image);
      }
    );

    const image = images[0].buffer;
    await Jimp.read(image)
      .then(async (image) => {
        image.cover(100, 100);
        images[0].buffer = await image.getBufferAsync(Jimp.MIME_PNG);
      })
      .catch((err: Error) => {
        return res.status(400).json({ err });
      });

    imageResult = await uploadFile(images[0]);
    Object.assign(series, { image: imageResult.Key });
  }

  // Large image for detailed series information
  if (images[1]) {
    Series.findById(
      req.params.seriesID,
      function (findError: mongoose.Document, series: SeriesInterface) {
        if (findError) return res.status(400).json(findError);
        if (series.mainImage) deleteFile(series.mainImage);
      }
    );

    const image = images[1].buffer;
    await Jimp.read(image)
      .then(async (image) => {
        image.cover(800, 500);
        images[1].buffer = await image.getBufferAsync(Jimp.MIME_PNG);
      })
      .catch((err: Error) => {
        return res.status(400).json({ err });
      });

    mainImageResult = await uploadFile(images[1]);
    Object.assign(series, { mainImage: mainImageResult.Key });
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
  Series.findById(
    req.params.seriesID,
    function (findError: mongoose.Document, series: SeriesInterface) {
      if (findError) return res.status(400).json(findError);
      if (series.image) deleteFile(series.image);
    }
  );

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
