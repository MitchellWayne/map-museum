const express = require('express');
const router = express.Router();

const noteController = require('../controllers/noteController.js');

// Get note listing
router.get('/', noteController.notelist_get);

module.exports = router;