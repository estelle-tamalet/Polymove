import * as studentModel from "../models/student.model.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";
import { getPublisher } from "./rabbitmq.publisher.js";

export interface RegisterStudentData {
  firstname: string;
  name: string;
  domain: string;
}

export async function registerStudent(data: RegisterStudentData): Promise<studentModel.Student> {
  const { firstname, name, domain } = data;
  
  console.log("[Student Service] registerStudent called with:", { firstname, name, domain });

  if (!firstname || !name || !domain) {
    throw new ValidationError("Missing fields");
  }

  console.log("[Student Service] Creating student...");
  const student = await studentModel.createStudent({ firstname, name, domain });
  console.log("[Student Service] Student created:", student);

  // Publish student.registered event to RabbitMQ
  try {
    const publisher = getPublisher();
    if (publisher) {
      const event = {
        studentId: student.id,
        name: student.name,
        domain: student.domain,
        createdAt: new Date(),
      };
      await publisher.publish("student.registered", event);
      console.log(`[Student Service] Published student.registered event for student ${student.id}`);
    }
  } catch (err) {
    // Log but don't fail - message bus is optional
    console.error("Failed to publish student.registered event:", err);
  }

  return student;
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
