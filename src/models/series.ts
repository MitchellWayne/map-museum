export {};

import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const seriesSchema = new Schema({
  name: { type: String, required: true },
  notes: [{ type: Schema.Types.ObjectId, ref: 'Note', required: true }],
});

module.exports = mongoose.model('Series', seriesSchema);
