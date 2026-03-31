import { Request, Response } from "express";
import * as notificationService from "../services/notification.service.js";

export async function getStudentNotifications(req: Request, res: Response): Promise<void> {
  try {
    const studentId = parseInt(req.params.id);

    if (isNaN(studentId)) {
      res.status(400).json({ error: "Invalid student ID" });
      return;
    }

    const notifications = await notificationService.getNotificationsByStudentId(studentId);
    res.json(notifications);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function markNotificationAsRead(req: Request, res: Response): Promise<void> {
  try {
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      res.status(400).json({ error: "Invalid notification ID" });
      return;
    }

    const notification = await notificationService.markAsRead(notificationId);
    res.json(notification);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}
