import { Request, Response } from "express";
import * as subscriberService from "../services/subscriber.service.js";

export async function getSubscribers(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;

    if (!studentId || isNaN(Number(studentId))) {
      res.status(400).json({ error: "Invalid studentId" });
      return;
    }

    const subscribers = await subscriberService.getSubscribers(Number(studentId));
    res.json(subscribers);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    const message = (err as Error).message || "Internal server error";
    res.status(statusCode).json({ error: message });
  }
}

export async function updateSubscriber(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const { channel, contact, enabled } = req.body;

    if (!studentId || isNaN(Number(studentId))) {
      res.status(400).json({ error: "Invalid studentId" });
      return;
    }

    if (!channel) {
      res.status(400).json({ error: "Channel is required" });
      return;
    }

    const updated = await subscriberService.updateSubscriber(Number(studentId), channel, {
      contact,
      enabled,
    });

    res.json(updated);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    const message = (err as Error).message || "Internal server error";
    res.status(statusCode).json({ error: message });
  }
}

export async function deleteSubscriber(req: Request, res: Response): Promise<void> {
  try {
    const { studentId } = req.params;
    const { channel } = req.query;

    if (!studentId || isNaN(Number(studentId))) {
      res.status(400).json({ error: "Invalid studentId" });
      return;
    }

    if (!channel) {
      res.status(400).json({ error: "Channel query parameter is required" });
      return;
    }

    await subscriberService.deleteSubscriber(Number(studentId), String(channel));

    res.json({
      message: `Subscriber removed from channel ${channel}`,
    });
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    const message = (err as Error).message || "Internal server error";
    res.status(statusCode).json({ error: message });
  }
}

export async function createSubscriber(req: Request, res: Response): Promise<void> {
  try {
    const { studentId, domain, channel, contact, enabled } = req.body;

    const subscriber = await subscriberService.createSubscriber({
      studentId,
      domain,
      channel,
      contact,
      enabled,
    });

    res.status(201).json({
      message: "Subscriber created successfully",
      subscriber,
    });
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    const message = (err as Error).message || "Internal server error";
    res.status(statusCode).json({ error: message });
  }
}
