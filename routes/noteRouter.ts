export {};

const express = require('express');
const router = express.Router();

const noteController = require('../controllers/noteController.js');

// Get note listing by series (or all if params left empty)
// This should probably only return some data (Like just IDs + Title + Coords / etc.)
router.get('/', noteController.notelist_get);

router.post('/', noteController.note_post);
router.get('/:noteID', noteController.note_get);
router.put('/:noteID', noteController.note_put);
router.delete('/:noteID', noteController.note_delete);

module.exports = router;