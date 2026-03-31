import { pool } from "../db/db.js";
import { Notification, NotificationData } from "../models/notification.model.js";

export async function createNotification(data: NotificationData): Promise<Notification> {
  const result = await pool.query(
    `INSERT INTO notifications (student_id, type, offer_id, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, student_id as "studentId", type, offer_id as "offerId", message, read, created_at as "createdAt"`,
    [data.studentId, data.type, data.offerId, data.message]
  );

  return result.rows[0] as Notification;
}

export async function getNotificationsByStudentId(studentId: number): Promise<Notification[]> {
  const result = await pool.query(
    `SELECT id, student_id as "studentId", type, offer_id as "offerId", message, read, created_at as "createdAt"
     FROM notifications
     WHERE student_id = $1
     ORDER BY created_at DESC`,
    [studentId]
  );

  return result.rows as Notification[];
}

export async function getNotificationById(id: number): Promise<Notification | undefined> {
  const result = await pool.query(
    `SELECT id, student_id as "studentId", type, offer_id as "offerId", message, read, created_at as "createdAt"
     FROM notifications
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] as Notification | undefined;
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const result = await pool.query(
    `UPDATE notifications
     SET read = TRUE
     WHERE id = $1
     RETURNING id, student_id as "studentId", type, offer_id as "offerId", message, read, created_at as "createdAt"`,
    [id]
  );

  return result.rows[0] as Notification;
}
