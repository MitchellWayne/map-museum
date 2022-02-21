import * as express from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import { uploadFile, deleteFile, getFileStream } from '../s3';

import Note from '../models/note';
import Series from '../models/series';
import { NoteInterface, SeriesInterface } from '../types';

// Hints
// - Query params for specifying optional filters for data to return
// - URL paths for returning data with strict rules / no optional filters
// - Body params for interacting with CUD operations

async function updateSeries(
  noteID: NoteInterface['_id'],
  seriesID: SeriesInterface['_id'],
  willPush: boolean
): Promise<boolean> {
  let updateArg: mongoose.QueryOptions;
  if (willPush) updateArg = { $push: { notes: noteID } };
  else updateArg = { $pull: { notes: noteID } };
  await Series.findByIdAndUpdate(seriesID, updateArg).catch(
    (updateError: mongoose.Error) => {
      console.log(updateError);
      return false;
    }
  );
  return true;
}

// Return a list of notes with limited info
export function notelist_get(req: express.Request, res: express.Response) {
  const { seriesfilterID } = req.query;

  Note.find()
    .select('series title latlong')
    .exec(function (err, notelist) {
      if (err) return res.status(400).json(err);
      else if (seriesfilterID) {
        notelist = notelist.filter((note) => note.series === seriesfilterID);
        return res.status(200).json(notelist);
      } else return res.status(200).json(notelist);
    });
}

// Return a detailed list of notes by series ID
export function notelistdetailed_get(
  req: express.Request,
  res: express.Response
) {
  const { seriesfilterID } = req.query;

  Note.find({ series: seriesfilterID }).exec(function (err, notelist) {
    if (err) return res.status(400).json(err);
    else {
      return res.status(200).json(notelist);
    }
  });
}

// Return full note from _id (URL Path)
export function note_get(req: express.Request, res: express.Response) {
  Note.findById(req.params.noteID).exec(function (err, note) {
    if (err) return res.status(400).json(err);
    else if (!note)
      return res
        .status(404)
        .json({ err: `note with id ${req.params.noteID} not found` });
    else return res.status(200).json(note);
  });
}

// Create a new note
// Should also return a URI to that new note
export async function note_post(req: express.Request, res: express.Response) {
  const errors = validationResult(req);
  let s3result = null;
  if (!errors.isEmpty()) return res.status(400).json(errors);

  if (req.file) {
    s3result = await uploadFile(req.file);
  }

  const note = new Note({
    series: req.body.series,
    title: req.body.title,
    location: req.body.location,
    synopsis: req.body.synopsis,
    locdetails: req.body.locdetails,
    latlong: req.body.latlong,
    image: s3result ? s3result.Key : null,
  });

  await note.save().catch((saveError: mongoose.Error) => {
    return res.status(400).json({ saveError });
  });

  if (await updateSeries(note._id, note.series, true)) {
    return res.status(201).json({
      message: `Successfully created note and appended to series of id '${note.series}'`,
      uri: `${req.header('Host')}/note/${note._id}`,
    });
  } else {
    return res.status(201).json({
      message: `Successfully created note but failed to save to Series with id '${note.series}'`,
      uri: `${req.header('Host')}/note/${note._id}`,
    });
  }
}

// Update an existing note by _id
export async function note_put(req: express.Request, res: express.Response) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json(errors);

  const note = {
    series: req.body.series,
    title: req.body.title,
    location: req.body.location,
    synopsis: req.body.synopsis,
    locdetails: req.body.locdetails,
  };

  if (req.file) {
    // Delete old image then concat new s3 key to updating note obj
    Note.findById(
      req.params.noteID,
      function (findError: mongoose.Document, note: NoteInterface) {
        if (findError) return res.status(400).json(findError);
        if (note.image) deleteFile(note.image);
      }
    );

    const s3result = await uploadFile(req.file);
    Object.assign(note, { image: s3result.Key });
  }

  Note.findByIdAndUpdate(
    req.params.noteID,
    note,
    function (updateError: mongoose.Document, updatedNote: NoteInterface) {
      if (updateError) return res.status(400).json(updateError);
      return res.status(200).json({
        message: 'Successfully updated note.',
        uri: `${req.header('Host')}/note/${updatedNote._id}`,
      });
    }
  );
}

// Delete an existing note by _id
export async function note_delete(req: express.Request, res: express.Response) {
  const deletedNote = await Note.findByIdAndDelete(req.params.noteID).catch(
    (delError: mongoose.Error) => {
      return res.status(400).json({ delError });
    }
  );

  if (deletedNote.image) {
    await deleteFile(deletedNote.image);
  }

  if (await updateSeries(deletedNote._id, deletedNote.series, false)) {
    return res.status(201).json({
      message: `Successfully deleted note with id '${deletedNote._id}'`,
    });
  } else {
    return res.status(201).json({
      message: `Successfully deleted note with id '${deletedNote._id}' but failed to pull from Series with id '${deletedNote.series}'`,
    });
  }
}

export function noteimage_get(req: express.Request, res: express.Response) {
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
}
