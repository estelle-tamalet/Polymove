import * as studentModel from "../models/student.model.js";
import { getAggregatedOffers } from "./offerAggregator.service.js";

export interface RecommendationOptions {
  limit?: number;
  sortBy?: string;
}

export interface StudentRecommendation {
  student: studentModel.Student;
  offers: any[];
}

export async function getRecommendedOffers(
  studentId: unknown,
  { limit = 5, sortBy }: RecommendationOptions = {}
): Promise<StudentRecommendation> {
  const parsedId = typeof studentId === "string" ? Number(studentId) : studentId as number;
  if (Number.isNaN(parsedId)) {
    throw new Error("Invalid student id");
  }

  const student = await studentModel.getStudentById(parsedId);
  if (!student) {
    throw new Error("Student not found");
  }

  const offers = await getAggregatedOffers();

  let filtered = offers.filter((o: any) => o.domain === student.domain);

  if (sortBy) {
    filtered = filtered.sort((a: any, b: any) => {
      const aScore = a.cityScore?.[sortBy] ?? -Infinity;
      const bScore = b.cityScore?.[sortBy] ?? -Infinity;
      return bScore - aScore;
    });
  }

  filtered = filtered.slice(0, Number(limit) || 5);

  return {
    student,
    offers: filtered
  };
}
