import express from "express";
import * as offerController from "../controllers/offer.controller.js";

const router = express.Router();

router.post("/offer", offerController.createOffer);
router.get("/offer", offerController.getOffers);
router.get("/offer/:id", offerController.getOfferById);
router.put("/offer/:id", offerController.updateOffer);
router.delete("/offer/:id", offerController.deleteOffer);

export default router;
