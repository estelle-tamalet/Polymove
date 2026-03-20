import { Request, Response } from "express";
import * as offerService from "../services/offer.service";

export async function createOffer(req: Request, res: Response): Promise<void> {
  try {
    const offer = await offerService.createOffer(req.body);
    res.status(201).json(offer);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function getOfferById(req: Request, res: Response): Promise<void> {
  try {
    const offer = await offerService.getOfferById(req.params.id);
    res.json(offer);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function getOffers(req: Request, res: Response): Promise<void> {
  try {
    const offers = await offerService.getOffers(req.query as any);
    res.json(offers);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function updateOffer(req: Request, res: Response): Promise<void> {
  try {
    const offer = await offerService.updateOffer(req.params.id, req.body);
    res.json(offer);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function deleteOffer(req: Request, res: Response): Promise<void> {
  try {
    await offerService.deleteOffer(req.params.id);
    res.status(204).send();
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}
