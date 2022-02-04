import express from 'express';
import passport from 'passport';
const router = express.Router();

import { checkSeries } from '../validators';

import * as seriesController from '../controllers/seriesController.js';

router.get('/', seriesController.serieslist_get);

router.post(
  '/',
  checkSeries(),
  passport.authenticate('jwt', { session: false }),
  seriesController.series_post
);

router.delete(
  '/:seriesID',
  passport.authenticate('jwt', { session: false }),
  seriesController.series_delete
);
export default { router };
