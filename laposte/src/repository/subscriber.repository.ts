import { pool } from "../db/db.js";
import {
  Subscriber,
  SubscriberData,
  StudentRegisteredEvent,
} from "../models/subscriber.model.js";
import { NotFoundError, ConflictError, ValidationError } from "../utils/errors.js";

/**
 * Create a new subscriber
 * @param data - Subscriber data
 * @returns Created subscriber
 * @throws ConflictError if subscriber already exists
 */
export async function createSubscriber(data: SubscriberData): Promise<Subscriber> {
  try {
    const { studentId, domain, channel, contact = "", enabled = true } = data;

    if (!studentId || !domain || !channel) {
      throw new ValidationError("Missing required fields: studentId, domain, channel");
    }

    if (enabled && !contact) {
      throw new ValidationError("Contact is required when notifications are enabled");
    }

    if (!["discord", "email"].includes(channel)) {
      throw new ValidationError("Channel must be 'discord' or 'email'");
    }

    const existing = await pool.query(
      "SELECT * FROM subscribers WHERE student_id = $1 AND channel = $2",
      [studentId, channel]
    );

    if (existing.rows.length > 0) {
      throw new ConflictError(
        `Subscriber already exists for student ${studentId} on channel ${channel}`
      );
    }

    const result = await pool.query(
      `INSERT INTO subscribers (student_id, domain, channel, contact, enabled)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, student_id, domain, channel, contact, enabled, created_at, updated_at`,
      [studentId, domain, channel, contact, enabled]
    );

    return mapToSubscriber(result.rows[0]);
  } catch (err) {
    if (err instanceof (ConflictError || ValidationError)) {
      throw err;
    }
    throw new Error(`Failed to create subscriber: ${(err as Error).message}`);
  }
}

/**
 * Get subscriber by student ID
 * @param studentId - Student ID
 * @returns Subscriber
 * @throws NotFoundError if subscriber not found
 */
export async function getSubscribersByStudentId(studentId: number): Promise<Subscriber[]> {
  try {
    const result = await pool.query(
      "SELECT id, student_id, domain, channel, contact, enabled, created_at, updated_at FROM subscribers WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`No subscribers found for student ${studentId}`);
    }

    return result.rows.map(mapToSubscriber);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new Error(`Failed to get subscribers: ${(err as Error).message}`);
  }
}

/**
 * Get a specific subscriber by student ID and channel
 * @param studentId - Student ID
 * @param channel - Channel (discord or email)
 * @returns Subscriber
 * @throws NotFoundError if subscriber not found
 */
export async function getSubscriber(
  studentId: number,
  channel: string
): Promise<Subscriber> {
  try {
    const result = await pool.query(
      "SELECT id, student_id, domain, channel, contact, enabled, created_at, updated_at FROM subscribers WHERE student_id = $1 AND channel = $2",
      [studentId, channel]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(
        `Subscriber not found for student ${studentId} on channel ${channel}`
      );
    }

    return mapToSubscriber(result.rows[0]);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new Error(`Failed to get subscriber: ${(err as Error).message}`);
  }
}

/**
 * Update subscriber preferences
 * @param studentId - Student ID
 * @param channel - Channel
 * @param updates - Partial subscriber data to update
 * @returns Updated subscriber
 * @throws NotFoundError if subscriber not found
 */
export async function updateSubscriber(
  studentId: number,
  channel: string,
  updates: Partial<SubscriberData>
): Promise<Subscriber> {
  try {
    await getSubscriber(studentId, channel);

    const { contact, enabled } = updates;
    const setClauses: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (contact !== undefined) {
      setClauses.push(`contact = $${paramIndex}`);
      values.push(contact);
      paramIndex++;
    }

    if (enabled !== undefined) {
      setClauses.push(`enabled = $${paramIndex}`);
      values.push(enabled);
      paramIndex++;
    }

    setClauses.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(studentId);
    values.push(channel);

    const query = `
      UPDATE subscribers
      SET ${setClauses.join(", ")}
      WHERE student_id = $${paramIndex} AND channel = $${paramIndex + 1}
      RETURNING id, student_id, domain, channel, contact, enabled, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    return mapToSubscriber(result.rows[0]);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new Error(`Failed to update subscriber: ${(err as Error).message}`);
  }
}

/**
 * Delete subscriber
 * @param studentId - Student ID
 * @param channel - Channel
 * @throws NotFoundError if subscriber not found
 */
export async function deleteSubscriber(studentId: number, channel: string): Promise<void> {
  try {
    await getSubscriber(studentId, channel);

    await pool.query("DELETE FROM subscribers WHERE student_id = $1 AND channel = $2", [
      studentId,
      channel,
    ]);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw new Error(`Failed to delete subscriber: ${(err as Error).message}`);
  }
}

/**
 * Get all subscribers for a student (for internal use)
 * Used when processing student registered event
 */
export async function getAllSubscribers(studentId: number): Promise<Subscriber[]> {
  try {
    const result = await pool.query(
      "SELECT id, student_id, domain, channel, contact, enabled, created_at, updated_at FROM subscribers WHERE student_id = $1",
      [studentId]
    );

    return result.rows.map(mapToSubscriber);
  } catch (err) {
    throw new Error(`Failed to get all subscribers: ${(err as Error).message}`);
  }
}

/**
 * Get all subscribers for a domain
 * Used when processing offer created event
 */
export async function getSubscribersByDomain(domain: string): Promise<Subscriber[]> {
  try {
    const result = await pool.query(
      "SELECT id, student_id, domain, channel, contact, enabled, created_at, updated_at FROM subscribers WHERE domain = $1",
      [domain]
    );

    return result.rows.map(mapToSubscriber);
  } catch (err) {
    throw new Error(`Failed to get subscribers by domain: ${(err as Error).message}`);
  }
}

/**
 * Helper function to map database row to Subscriber object
 */
function mapToSubscriber(row: any): Subscriber {
  return {
    id: row.id,
    studentId: row.student_id,
    domain: row.domain,
    channel: row.channel as "discord" | "email",
    contact: row.contact,
    enabled: row.enabled,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
