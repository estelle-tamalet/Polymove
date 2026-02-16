import express from "express";
import * as internshipController from "../controllers/internship.controller.js";

const router = express.Router();

router.post("/internship", internshipController.createInternship);

export default router;
