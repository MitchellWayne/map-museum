import express from 'express';
import passport from 'passport';
const router = express.Router();

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
import { checkSeries } from '../validators';

import * as seriesController from '../controllers/seriesController.js';

router.get('/', seriesController.serieslist_get);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.array('imgfile', 2),
  checkSeries(),
  seriesController.series_post
);

router.put(
  '/:seriesID',
  passport.authenticate('jwt', { session: false }),
  upload.array('imgfile', 2),
  seriesController.series_put
);

router.delete(
  '/:seriesID',
  passport.authenticate('jwt', { session: false }),
  seriesController.series_delete
);

router.get('/:seriesID/image/:key', seriesController.seriesimage_get);

export default { router };
