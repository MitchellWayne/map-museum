const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let noteSchema = new Schema({
  series: {Type: Schema.Types.ObjectId, ref: 'Series', required: true},
  title: {type: String, required: true},
  location: {type: String, required: true},
  synposis: {type: String, required: true},
  locdetails: {type: String, required: true},
  latlong: {type: String, required: true},
  image: {type: String, required: true},
});

module.exports = mongoose.model('Note', noteSchema);