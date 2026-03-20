import { pool } from "../db/db";

export interface StudentData {
  firstname: string;
  name: string;
  domain: string;
}

export interface Student extends StudentData {
  id: number;
}

export async function createStudent({ firstname, name, domain }: StudentData): Promise<Student> {
  const result = await pool.query(
    `INSERT INTO students (firstname, name, domain)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [firstname, name, domain]
  );

  return result.rows[0] as Student;
}

export async function getAllStudents(domain?: string): Promise<Student[]> {
  if (domain) {
    const result = await pool.query(
      `SELECT * FROM students WHERE domain = $1 ORDER BY id`,
      [domain]
    );
    return result.rows as Student[];
  }

  const result = await pool.query(
    `SELECT * FROM students ORDER BY id`
  );
  return result.rows as Student[];
}

export async function getStudentById(id: number): Promise<Student | undefined> {
  const result = await pool.query(
    `SELECT * FROM students WHERE id = $1`,
    [id]
  );
  return result.rows[0] as Student | undefined;
}

export async function updateStudent(id: number, data: Partial<StudentData>): Promise<Student> {
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
  return result.rows[0] as Student;
}

export async function deleteStudent(id: number): Promise<void> {
  await pool.query(
    `DELETE FROM students WHERE id = $1`,
    [id]
  );
}
