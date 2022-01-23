const express = require('express');
const router = express.Router();

const seriesController = require('../controllers/seriesController.js');

series.get('/', seriesController.serieslist_get);

module.exports = router;