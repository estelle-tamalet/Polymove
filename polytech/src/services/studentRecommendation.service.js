import * as studentModel from "../models/student.model.js";
import { getAggregatedOffers } from "./offerAggregator.service.js";

export async function getRecommendedOffers(studentId, { limit = 5, sortBy } = {}) {
  const parsedId = Number(studentId);
  if (Number.isNaN(parsedId)) {
    throw new Error("Invalid student id");
  }

  const student = await studentModel.getStudentById(parsedId);
  if (!student) {
    throw new Error("Student not found");
  }

  const offers = await getAggregatedOffers();

  let filtered = offers.filter(o => o.domain === student.domain);

  if (sortBy) {
    filtered = filtered.sort((a, b) => {
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
