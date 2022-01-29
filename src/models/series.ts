export {}

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let seriesSchema = new Schema({
  name: {type: String, required: true},
  notes: [{type: Schema.Types.ObjectId, ref: 'Note', required: true}],
});

module.exports = mongoose.model('Series', seriesSchema);