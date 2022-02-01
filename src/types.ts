import { ObjectId } from 'mongoose';

export interface Note {
  series: ObjectId;
  title: string;
  location: string;
  synopsis: string;
  locdetails: string;
  latlong: string;
  image: string;
}

export interface Series {
  name: string;
  notes: [ObjectId];
}
