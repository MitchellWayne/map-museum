"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/seriesController.js');
router.get('/', seriesController.serieslist_get);
router.post('/', seriesController.series_post);
module.exports = router;
