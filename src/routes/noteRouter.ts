import express from 'express';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
import { checkPost, checkLatLong } from '../validators';

const router = express.Router();

import * as noteController from '../controllers/noteController.js';

// Get note listing by series (or all if params left empty)
// This should probably only return some data (Like just IDs + Title + Coords / etc.)
router.get('/', noteController.notelist_get);

router.get('/:noteID', noteController.note_get);

router.post(
  '/',
  upload.single('imgfile'),
  checkPost(),
  checkLatLong(),
  noteController.note_post
);

router.put(
  '/:noteID',
  upload.single('imgfile'),
  checkPost(),
  noteController.note_put
);

router.delete('/:noteID', noteController.note_delete);

router.get('/:noteID/image/:key', noteController.noteimage_get);

export default { router };
