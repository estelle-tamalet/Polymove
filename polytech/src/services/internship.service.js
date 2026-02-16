import axios from "axios";
import * as studentModel from "../models/student.model.js";
import * as internshipModel from "../models/internship.model.js";
import { NotFoundError, ValidationError } from "../utils/errors.js";

export async function registerInternship(studentId, offerId) {
  if (!studentId || !offerId) {
    throw new ValidationError("Missing studentId or offerId");
  }

  const parsedStudentId = parseInt(studentId);
  if (isNaN(parsedStudentId)) {
    throw new ValidationError("Invalid studentId");
  }

  const student = await studentModel.getStudentById(parsedStudentId);
  if (!student) {
    throw new NotFoundError("Student not found");
  }

  let offer;

  try {
    const res = await axios.get(`${process.env.OFFER_SERVICE_URL}/offer/${offerId}`);
    offer = res.data;
  } catch (err) {
    if (err.response?.status === 403) {
      throw new ValidationError("Offer not available");
    }
    throw new NotFoundError("Offer not found");
  }

  if (student.domain !== offer.domain) {
    return await internshipModel.createInternship({
      studentId: parsedStudentId,
      offerId,
      status: "rejected",
      message: "Domain does not match"
    });
  }

  return await internshipModel.createInternship({
    studentId: parsedStudentId,
    offerId,
    status: "approved",
    message: "Internship accepted"
  });
}
