import "dotenv/config";
import express, { Express, Request, Response } from "express";
import studentRoutes from "./routes/student.routes";
import internshipRoutes from "./routes/internship.routes";
import { getOffers } from "./services/offerAggregator.service";

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(studentRoutes);
app.use(internshipRoutes);

app.get("/offers", async (req: Request, res: Response): Promise<void> => {
  try {
    const offers = await getOffers(req.query);
    res.json(offers);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
