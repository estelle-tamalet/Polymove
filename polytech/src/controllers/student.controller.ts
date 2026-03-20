import { Request, Response } from "express";
import * as studentService from "../services/student.service";

export async function createStudent(req: Request, res: Response): Promise<void> {
  try {
    const student = await studentService.registerStudent(req.body);
    res.status(201).json(student);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function getStudents(req: Request, res: Response): Promise<void> {
  try {
    const domain = req.query.domain as string | undefined;
    const students = await studentService.listStudents(domain);
    res.json(students);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function getStudentById(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.getStudentById(id);
    res.json(student);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function updateStudent(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const student = await studentService.updateStudent(id, req.body);
    res.json(student);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    await studentService.deleteStudent(id);
    res.status(204).send();
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}
