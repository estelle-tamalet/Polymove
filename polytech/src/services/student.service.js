import * as studentModel from "../models/student.model.js";

export async function registerStudent(data) {
  const { firstname, name, domain } = data;

  if (!firstname || !name || !domain) {
    throw new Error("Missing fields");
  }

  return studentModel.createStudent({ firstname, name, domain });
}

export async function listStudents(domain) {
  return studentModel.getAllStudents(domain);
}

export async function getStudentById(id) {
  const student = await studentModel.getStudentById(id);

  if (!student) {
    throw new Error("Student not found");
  }

  return student;
}

export async function updateStudent(id, data) {
  const student = await studentModel.getStudentById(id);

  if (!student) {
    throw new Error("Student not found");
  }

  return studentModel.updateStudent(id, data);
}

export async function deleteStudent(id) {
  const student = await studentModel.getStudentById(id);

  if (!student) {
    throw new Error("Student not found");
  }

  return studentModel.deleteStudent(id);
}

