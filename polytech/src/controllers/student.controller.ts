import { Request, Response } from "express";
import * as studentService from "../services/student.service.js";
import * as studentRecommendationService from "../services/studentRecommendation.service.js";

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
    console.log(`Fetching student with id: ${id}`);
    const student = await studentService.getStudentById(id);
    console.log(`Student found:`, student);
    res.json(student);
  } catch (err) {
    console.error(`Error fetching student:`, err);
    const statusCode = (err as any).statusCode || 500;
    const message = (err as Error).message || "Unknown error";
    res.status(statusCode).json({ error: message });
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

export async function getRecommendedOffers(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const sortBy = req.query.sort_by as string | undefined;
    const recommendations = await studentRecommendationService.getRecommendedOffers(id, {
      limit,
      sortBy
    });
    res.json(recommendations);
  } catch (err) {
    const statusCode = (err as any).statusCode || 500;
    res.status(statusCode).json({ error: (err as Error).message });
  }
}
