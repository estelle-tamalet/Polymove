import express from "express";
import * as internshipController from "../controllers/internship.controller";

const router = express.Router();

router.post("/internship", internshipController.createInternship);

export default router;
