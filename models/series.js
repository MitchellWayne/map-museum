const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let seriesSchema = new Schema({
  notes: [{Type: Schema.Types.ObjectId, ref: 'Note', required: true}],
});

module.exports = mongoose.model('Series', seriesSchema);