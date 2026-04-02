import "dotenv/config";
import express, { Express, Request, Response } from "express";
import mongoose from "mongoose";
import offerRoutes from "./routes/offer.routes.js";

const app: Express = express();
const PORT = process.env.PORT || 4000;

// CORS middleware
app.use((req: Request, res: Response, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(offerRoutes);

mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/erasmumu");

mongoose.connection.once("open", () => {
  console.log("Mongo connected");
});

app.listen(PORT, () => {
  console.log("Erasmumu running on port " + PORT);
});
