/**
 * Subscriber Routes
 * REST API endpoints for subscriber management
 */

import express, { Router } from "express";
import * as subscriberController from "../controllers/subscriber.controller.js";

const router: Router = express.Router();

/**
 * GET /subscribers/:studentId
 * Get all subscriber preferences for a student
 */
router.get("/subscribers/:studentId", subscriberController.getSubscribers);

/**
 * POST /subscribers
 * Create a new subscriber preference
 */
router.post("/subscribers", subscriberController.createSubscriber);

/**
 * PUT /subscribers/:studentId
 * Update subscriber preferences (channel must be in body)
 */
router.put("/subscribers/:studentId", subscriberController.updateSubscriber);

/**
 * DELETE /subscribers/:studentId
 * Unsubscribe from notifications (channel as query param)
 */
router.delete("/subscribers/:studentId", subscriberController.deleteSubscriber);

export default router;
