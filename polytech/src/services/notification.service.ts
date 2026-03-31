import * as notificationRepository from "../repository/notification.repository.js";
import { Notification, NotificationData } from "../models/notification.model.js";
import { NotFoundError } from "../utils/errors.js";

export async function createNotification(data: NotificationData): Promise<Notification> {
  return notificationRepository.createNotification(data);
}

export async function getNotificationsByStudentId(studentId: number): Promise<Notification[]> {
  return notificationRepository.getNotificationsByStudentId(studentId);
}

export async function markAsRead(notificationId: number): Promise<Notification> {
  const notification = await notificationRepository.getNotificationById(notificationId);

  if (!notification) {
    throw new NotFoundError("Notification not found");
  }

  return notificationRepository.markNotificationAsRead(notificationId);
}

export interface OfferCreatedEvent {
  offerId: string;
  title: string;
  city: string;
  domain: string;
  salary?: number;
  createdAt: Date;
}

export async function handleOfferCreated(event: OfferCreatedEvent, studentDomain: string): Promise<void> {
  if (event.domain !== studentDomain) {
    return;
  }

  const notification: NotificationData = {
    studentId: 0,
    type: "new_offer",
    offerId: event.offerId,
    message: `New ${event.domain} internship in ${event.city}: ${event.title}`,
  };

  await notificationRepository.createNotification(notification);
}
