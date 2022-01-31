import express from 'express';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const validator = require('../validators');
const router = express.Router();

import * as noteController from '../controllers/noteController.js';

// Get note listing by series (or all if params left empty)
// This should probably only return some data (Like just IDs + Title + Coords / etc.)
router.get('/', noteController.notelist_get);

router.get('/:noteID', noteController.note_get);
router.post(
  '/',
  validator.checkPost,
  upload.single('imgfile'),
  noteController.note_post
);
router.put(
  '/:noteID',
  validator.checkPost,
  upload.single('imgfile'),
  noteController.note_put
);
router.delete('/:noteID', noteController.note_delete);

export default { router };
