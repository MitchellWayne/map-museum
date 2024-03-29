import express from 'express';
import passport from 'passport';

import multer from 'multer';
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
import { checkPost, checkLatLong } from '../validators';

const router = express.Router();

import * as noteController from '../controllers/noteController.js';

// Get note listing by series (or all if params left empty)
// This should probably only return some data (Like just IDs + Title + Coords / etc.)
router.get('/', noteController.notelist_get);

router.get('/detailed', noteController.notelistdetailed_get);

router.get('/:noteID', noteController.note_get);

router.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  upload.array('imgfile', 2),
  checkPost(),
  checkLatLong(),
  noteController.note_post
);

router.put(
  '/:noteID',
  passport.authenticate('jwt', { session: false }),
  upload.array('imgfile', 2),
  checkPost(),
  noteController.note_put
);

router.delete(
  '/:noteID',
  passport.authenticate('jwt', { session: false }),
  noteController.note_delete
);

router.get('/:noteID/image/:key', noteController.noteimage_get);

export default { router };
