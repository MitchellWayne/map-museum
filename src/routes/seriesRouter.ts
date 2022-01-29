export {};

import express from 'express';
const router = express.Router();

import * as seriesController from '../controllers/seriesController.js';

router.get('/', seriesController.serieslist_get);

router.post('/', seriesController.series_post);

module.exports = router;
