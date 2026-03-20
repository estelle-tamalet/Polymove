import mongoose from "mongoose";

export interface IOfferDocument extends mongoose.Document {
  title: string;
  link?: string;
  city: string;
  domain: string;
  salary?: number;
  startDate?: Date;
  endDate?: Date;
  available: boolean;
}

const offerSchema = new mongoose.Schema<IOfferDocument>({
  title: { type: String, required: true },
  link: String,
  city: { type: String, required: true },
  domain: { type: String, required: true },
  salary: Number,
  startDate: Date,
  endDate: Date,
  available: { type: Boolean, default: true }
});

export const Offer = mongoose.model<IOfferDocument>("Offer", offerSchema);
