import { ObjectId } from 'mongoose';

export interface NoteInterface {
  _id: ObjectId;
  series: ObjectId;
  title: string;
  location: string;
  synopsis: string;
  locdetails: string;
  latlong: string;
  image: string;
}

export interface SeriesInterface {
  _id: ObjectId;
  name: string;
  notes: ObjectId[];
  image: string;
  mainImage: string;
}
