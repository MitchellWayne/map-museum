import { body } from 'express-validator';

import Series from './models/series';

export function checkPost() {
  return [
    body('series').custom(async (seriesID) => {
      const seriesExists = await Series.exists({ _id: seriesID });
      if (seriesExists) return true;
      else return Promise.reject(`Series with ID ${seriesID} does not exist.`);
    }),
    body('title', 'Title field must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body('location').trim().escape(),
    body('synopsis').trim().escape(),
    body('locdetails').trim().escape(),
  ];
}

export function checkLatLong() {
  return [
    body('latlong', 'Invalid longitide / latitude coordinates.')
      .trim()
      .isLatLong(),
  ];
}

export function checkSeries() {
  return [
    body('name', 'Series name must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),
    body('description', 'Series description field must not be empty.')
      .trim()
      .isLength({ min: 1 })
      .escape(),
  ];
}
