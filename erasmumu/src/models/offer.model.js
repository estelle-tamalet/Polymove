import mongoose from "mongoose";

const offerSchema = new mongoose.Schema({
  title: String,
  link: String,
  city: String,
  domain: String,
  salary: Number,
  startDate: Date,
  endDate: Date,
  available: Boolean
});

export const Offer = mongoose.model("Offer", offerSchema);
