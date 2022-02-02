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

function appendNoteToSeries(
  noteID: NoteInterface['_id'],
  seriesID: SeriesInterface['_id']
) {
  Series.findByIdAndUpdate(
    seriesID,
    { $push: { notes: noteID } },
    function (updateError: mongoose.Document) {
      if (updateError) return false;
      else return true;
    }
  );
}

// Return a list of notes with limited info
export function notelist_get(req: express.Request, res: express.Response) {
  const { seriesFilterID } = req.query;

  Note.find()
    .select('series title longitude latitude')
    .exec(function (err, notelist) {
      if (err) return res.status(400).json(err);
      else if (seriesFilterID) {
        notelist = notelist.filter((note) => note.series === seriesFilterID);
        return res.status(200).json(notelist);
      } else return res.status(200).json(notelist);
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

  new Note({
    series: req.body.series,
    title: req.body.title,
    location: req.body.location,
    synopsis: req.body.synopsis,
    locdetails: req.body.locdetails,
    latlong: req.body.latlong,
    image: s3result ? s3result.Key : null,
  }).save((saveError: mongoose.Document, note: NoteInterface) => {
    if (saveError) return res.status(400).json({ saveError });
    if (appendNoteToSeries(note._id, req.body.series)) {
      return res.status(201).json({
        message: 'Successfully created note',
        uri: `${req.hostname}/note/${note._id}`,
      });
    } else {
      return res.status(201).json({
        message: `Successfully created note but failed to save to Series with id '${req.body.series}'`,
        uri: `${req.hostname}/note/${note._id}`,
      });
    }
  });
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
      async function (findError: mongoose.Document, note: NoteInterface) {
        if (findError) return res.status(400).json(findError);
        deleteFile(note.image);
      }
    );

    const s3result = await uploadFile(req.file);
    console.log(s3result);
    Object.assign(note, { image: s3result.Key });
  }

  Note.findByIdAndUpdate(
    req.params.nodeID,
    note,
    function (updateError: mongoose.Document, updatedNote: NoteInterface) {
      if (updateError) return res.status(400).json(updateError);
      return res.status(200).json({
        message: 'Successfully updated note.',
        uri: `${req.hostname}/note/${updatedNote._id}`,
      });
    }
  );
}

// Delete an existing note by _id
export function note_delete(req: express.Request, res: express.Response) {
  Note.findByIdAndDelete(
    req.params.noteID,
    async function (delError: mongoose.Document, delNote: NoteInterface) {
      if (delError) return res.status(400).json(delError);
      if (delNote.image) {
        const s3result = await deleteFile(delNote.image);
        console.log(s3result);
      }
      return res.status(200).json({
        message: `Successfully deleted note with id ${req.params.noteID}`,
      });
    }
  );
}

export function noteimage_get(req: express.Request, res: express.Response) {
  const key = req.params.key;
  const readStream = getFileStream(key);

  readStream.pipe(res);
}
