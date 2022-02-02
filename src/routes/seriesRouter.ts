import express from 'express';
const router = express.Router();

import { checkSeries } from '../validators';

import * as seriesController from '../controllers/seriesController.js';

router.get('/', seriesController.serieslist_get);

router.post('/', checkSeries(), seriesController.series_post);

export default { router };
