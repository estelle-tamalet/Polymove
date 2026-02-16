import { pool } from "../db/db.js";

export async function createStudent({ firstname, name, domain }) {
  const result = await pool.query(
    `INSERT INTO students (firstname, name, domain)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [firstname, name, domain]
  );

  return result.rows[0];
}

export async function getAllStudents(domain) {
  if (domain) {
    const result = await pool.query(
      `SELECT * FROM students WHERE domain = $1 ORDER BY id`,
      [domain]
    );
    return result.rows;
  }

  const result = await pool.query(
    `SELECT * FROM students ORDER BY id`
  );
  return result.rows;
}

export async function getStudentById(id) {
  const result = await pool.query(
    `SELECT * FROM students WHERE id = $1`,
    [id]
  );
  return result.rows[0];
}

export async function updateStudent(id, data) {
  const { firstname, name, domain } = data;
  const result = await pool.query(
    `UPDATE students
     SET firstname = COALESCE($1, firstname),
         name = COALESCE($2, name),
         domain = COALESCE($3, domain)
     WHERE id = $4
     RETURNING *`,
    [firstname, name, domain, id]
  );
  return result.rows[0];
}

export async function deleteStudent(id) {
  await pool.query(
    `DELETE FROM students WHERE id = $1`,
    [id]
  );
}
