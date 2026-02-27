import express from "express";
import * as studentController from "../controllers/student.controller";

const router = express.Router();

router.post("/student", studentController.createStudent);
router.get("/student", studentController.getStudents);
router.get("/student/:id", studentController.getStudentById);
router.put("/student/:id", studentController.updateStudent);
router.delete("/student/:id", studentController.deleteStudent);
router.get("/students/:id/recommended-offers",studentController.getRecommendedOffers);

export default router;
