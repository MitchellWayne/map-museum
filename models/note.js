const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// TODO
// ADD SERIES MODEL
// SERIES DOCUMENTS CONTAINS LIST OF NOTES
// ADD SERIES TO NOTE SCHEMA

let noteSchema = new Schema({
  series: {Type: Schema.Types.ObjectId, ref: 'Series', required: true},
  title: {type: String, required: true},
  location: {type: String, required: true},
  synposis: {type: String, required: true},
  locdetails: {type: String, required: true},
  longitude: {type: Double, required: true},
  latitude: {type: Double, required: true},
  image: {type: String, required: true},
});

module.exports = mongoose.model('Note', noteSchema);