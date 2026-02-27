import express, { Request, Response } from "express";
import { getOffers } from "../services/offerAggregator.service";

const router = express.Router();

router.get("/offers", async (req: Request, res: Response): Promise<void> => {
  try {
    const offers = await getOffers(req.query);
    res.json(offers);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
});

export default router;
