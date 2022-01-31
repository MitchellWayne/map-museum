import { check } from 'express-validator/check';

import Series from './models/series';

exports.checkPost = [
  check('series').custom(async (seriesID) => {
    const seriesExists = await Series.exists({ _id: seriesID });
    if (seriesExists) return true;
    else return Promise.reject(`Series with ID ${seriesID} does not exist.`);
  }),
  check('title', 'Title field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check('location', 'Location field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check('synposis', 'Synopsis field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check('locdetails', 'Location details field must not be empty.')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  check('latlong', 'Invalid longitide / latitude coordinates.')
    .trim()
    .isLatLong(),
];
