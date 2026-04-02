import { Request, Response } from "express";
import * as internshipService from "../services/internship.service.js";

export async function createInternship(req: Request, res: Response): Promise<void> {
  try {
    const { studentId, offerId } = req.body;

    const result = await internshipService.registerInternship(studentId, offerId);
    res.status(201).json(result);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}
