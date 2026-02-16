import * as studentService from "../services/student.service.js";

export async function createStudent(req, res) {
  try {
    const student = await studentService.registerStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function getStudents(req, res) {
  try {
    const domain = req.query.domain;
    const students = await studentService.listStudents(domain);
    res.json(students);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function getStudentById(req, res) {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.getStudentById(id);
    res.json(student);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function updateStudent(req, res) {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.updateStudent(id, req.body);
    res.json(student);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function deleteStudent(req, res) {
  try {
    const id = parseInt(req.params.id);
    await studentService.deleteStudent(id);
    res.status(204).send();
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}
