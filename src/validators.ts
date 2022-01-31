import { body } from 'express-validator/check';

import Series from './models/series';

exports.checkPost = [
  body('series').custom(async (seriesID) => {
    const seriesExists = await Series.exists({ _id: seriesID });
    if (seriesExists) return true;
    else return Promise.reject(`Series with ID ${seriesID} does not exist.`);
  }),
  body('title', 'Title field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('location', 'Location field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('synposis', 'Synopsis field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('locdetails', 'Location details field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('latlong', 'Invalid longitide / latitude coordinates.')
    .trim()
    .isLatLong(),
];
