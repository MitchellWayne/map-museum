const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let seriesSchema = new Schema({
  name: {Type: String, required: true},
  notes: [{Type: Schema.Types.ObjectId, ref: 'Note', required: true}],
});

module.exports = mongoose.model('Series', seriesSchema);