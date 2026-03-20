import { pool } from "../db/db";

export interface InternshipData {
  studentId: number;
  offerId: string;
  status: "approved" | "rejected";
  message: string;
}

export interface Internship extends InternshipData {
  id: number;
}

export async function createInternship({ studentId, offerId, status, message }: InternshipData): Promise<Internship> {
  const result = await pool.query(
    `INSERT INTO internships (student_id, offer_id, status, message)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [studentId, offerId, status, message]
  );

  return result.rows[0] as Internship;
}
