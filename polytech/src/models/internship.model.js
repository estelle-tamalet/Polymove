import { pool } from "../db/db.js";

export async function createInternship({ studentId, offerId, status, message }) {
  const result = await pool.query(
    `INSERT INTO internships (student_id, offer_id, status, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [studentId, offerId, status, message]
  );

  return result.rows[0];
}
