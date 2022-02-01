import { ObjectId } from 'mongoose';

export interface NoteInterface {
  _id: string;
  series: ObjectId;
  title: string;
  location: string;
  synopsis: string;
  locdetails: string;
  latlong: string;
  image: string;
}

export interface SeriesInterface {
  _id: string;
  name: string;
  notes: [ObjectId];
}
