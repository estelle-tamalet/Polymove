import axios from "axios";
import * as studentModel from "../models/student.model";
import * as internshipModel from "../models/internship.model";
import { NotFoundError, ValidationError } from "../utils/errors";

export interface Offer {
  domain: string;
  [key: string]: unknown;
}

export async function registerInternship(studentId: unknown, offerId: unknown): Promise<internshipModel.Internship> {
  if (!studentId || !offerId) {
    throw new ValidationError("Missing studentId or offerId");
  }

  const parsedStudentId = typeof studentId === "string" ? parseInt(studentId) : studentId as number;
  if (isNaN(parsedStudentId)) {
    throw new ValidationError("Invalid studentId");
  }

  const student = await studentModel.getStudentById(parsedStudentId);
  if (!student) {
    throw new NotFoundError("Student not found");
  }

  let offer: Offer;

  try {
    const res = await axios.get<Offer>(`${process.env.OFFER_SERVICE_URL}/offer/${offerId}`);
    offer = res.data;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 403) {
      throw new ValidationError("Offer not available");
    }
    throw new NotFoundError("Offer not found");
  }

  if (student.domain !== offer.domain) {
    return await internshipModel.createInternship({
      studentId: parsedStudentId,
      offerId: String(offerId),
      status: "rejected",
      message: "Domain does not match"
    });
  }

  return await internshipModel.createInternship({
    studentId: parsedStudentId,
    offerId: String(offerId),
    status: "approved",
    message: "Internship accepted"
  });
}
