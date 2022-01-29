"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
let noteSchema = new Schema({
    series: { type: Schema.Types.ObjectId, ref: 'Series', required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    synposis: { type: String, required: true },
    locdetails: { type: String, required: true },
    latlong: { type: String, required: true },
    image: { type: String, required: true }, // this should be an img url for now, until you figure out image storage
});
module.exports = mongoose.model('Note', noteSchema);
