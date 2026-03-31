import express from "express";
import * as notificationController from "../controllers/notification.controller.js";

const router = express.Router();

router.get("/students/:id/notifications", notificationController.getStudentNotifications);
router.put("/notifications/:id/read", notificationController.markNotificationAsRead);

export default router;
