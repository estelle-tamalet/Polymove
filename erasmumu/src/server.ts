import "dotenv/config";
import express, { Express } from "express";
import mongoose from "mongoose";
import offerRoutes from "./routes/offer.routes.js";

const app: Express = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(offerRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/erasmumu");

mongoose.connection.once("open", () => {
  console.log("Mongo connected");
});

app.listen(PORT, () => {
  console.log("Erasmumu running on port " + PORT);
});
