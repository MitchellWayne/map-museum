import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  series: { type: Schema.Types.ObjectId, ref: 'Series', required: true },
  title: { type: String, required: true },
  location: { type: String, required: false },
  synopsis: { type: String, required: false },
  locdetails: { type: String, required: false },
  latlong: { type: String, required: true }, // format is 'lat,long'
  image: { type: String, required: false },
});

// module.exports = mongoose.model('Note', noteSchema);
export default mongoose.model('Note', noteSchema);
