const { body, validationResult } = require('express-validator');

const Note = require('../models/note');
const Series = require('../models/series');

// Hints
// - Query params for specifying optional filters for data to return
// - URL paths for returning data with strict rules / no optional filters
// - Body params for interacting with CUD operations

// Return a list of notes with limited info
exports.notelist_get = function(req, res) {
  const { seriesfilter } = req.query;

  Note.find()
  .select('series title longitude latitude')
  .exec(function(err, notelist){
    if(err) return res.status(400).json(err);
    else if (seriesfilter) { 
      notelist = notelist.filter(x => (x.series.toLowerCase()).includes(seriesfilter));
      return res.status(200).json(notelist);
    }
    else return res.status(200).json(notelist);
  });
};

// Return full note from _id (URL Path)
exports.note_get = function(req, res) {
  Note.findById(req.params.noteID)
  .exec(function(err, note){
    if(err) return res.status(400).json(err);
    else if(!note) return res.status(404).json({err: `note with id ${req.params.noteID} not found`});
    else return res.status(200).json(note);
  });
};

// Create a new note
// Should also return a URI to that new note
exports.note_post = [
  body('series').custom(seriesID => {
    const seriesExists = await Series.exists({_id: seriesID});
    if (seriesExists) return true;
    else return Promise.reject(`Series with ID ${seriesID} does not exist.`);
  }),
  body('title', 'Title field must not be empty.').trim().isLength({min: 1}).escape(),
  body('location', 'Location field must not be empty.').trim().isLength({min: 1}).escape(),
  body('synposis', 'Synopsis field must not be empty.').trim().isLength({min: 1}).escape(),
  body('locdetails', 'Location details field must not be empty.').trim().isLength({min: 1}).escape(),
  body('latlong', 'Invalid longitide / latitude coordinates.').isLatLong().trim(),
  bodu('image', 'Invalid image url.').isURL().trim(),

  (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json(errors);

    const note = new Note({
      series: req.body.series,
      title: req.body.title,
      location: req.body.location,
      synopsis: req.body.synopsis,
      locdetails: req.body.locdetails,
      latlong: req.body.latlong,
    })
  
  }
];

// Update an existing note by _id
exports.note_put = function(req, res) {

};

// Delete an existing note by _id
exports.note_delete = function(req, res) {

};