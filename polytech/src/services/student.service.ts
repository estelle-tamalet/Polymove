import * as studentModel from "../models/student.model.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

export interface RegisterStudentData {
  firstname: string;
  name: string;
  domain: string;
}

export async function registerStudent(data: RegisterStudentData): Promise<studentModel.Student> {
  const { firstname, name, domain } = data;

  if (!firstname || !name || !domain) {
    throw new ValidationError("Missing fields");
  }

  return studentModel.createStudent({ firstname, name, domain });
}

export async function listStudents(domain?: string): Promise<studentModel.Student[]> {
  return studentModel.getAllStudents(domain);
}

export async function getStudentById(id: number): Promise<studentModel.Student> {
  const student = await studentModel.getStudentById(id);

  if (!student) {
    throw new NotFoundError("Student not found");
  }

  return student;
}

export async function updateStudent(id: number, data: Partial<RegisterStudentData>): Promise<studentModel.Student> {
  const student = await studentModel.getStudentById(id);

  if (!student) {
    throw new NotFoundError("Student not found");
  }

  return studentModel.updateStudent(id, data);
}

export async function deleteStudent(id: number): Promise<void> {
  const student = await studentModel.getStudentById(id);

  if (!student) {
    throw new NotFoundError("Student not found");
  }

  return studentModel.deleteStudent(id);
}
