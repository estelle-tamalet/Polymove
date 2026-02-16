import * as offerService from "../services/offer.service.js";

export async function createOffer(req, res) {
  try {
    const offer = await offerService.createOffer(req.body);
    res.status(201).json(offer);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function getOfferById(req, res) {
  try {
    const offer = await offerService.getOfferById(req.params.id);
    res.json(offer);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function getOffers(req, res) {
  try {
    const offers = await offerService.getOffers(req.query);
    res.json(offers);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function updateOffer(req, res) {
  try {
    const offer = await offerService.updateOffer(req.params.id, req.body);
    res.json(offer);
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}

export async function deleteOffer(req, res) {
  try {
    await offerService.deleteOffer(req.params.id);
    res.status(204).send();
  } catch (err) {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({ error: err.message });
  }
}
