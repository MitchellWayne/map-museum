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
  seriesImage: string;
}

export interface SeriesInterface {
  _id: ObjectId;
  name: string;
  description: string;
  notes: ObjectId[];
  image: string;
  mainImage: string;
}
