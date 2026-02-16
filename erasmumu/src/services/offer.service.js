import { Offer } from "../models/offer.model.js";
import { NotFoundError, ValidationError, ForbiddenError } from "../utils/errors.js";

export async function createOffer(data) {
  const {
    title,
    link,
    city,
    domain,
    salary,
    startDate,
    endDate,
    available
  } = data;

  if (!title || !city || !domain) {
    throw new ValidationError("Missing required fields");
  }

  const offer = new Offer({
    title,
    link,
    city,
    domain,
    salary,
    startDate,
    endDate,
    available: available ?? true
  });

  return await offer.save();
}

export async function getOfferById(id) {
  try {
    const offer = await Offer.findById(id);

    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    if (offer.available === false) {
      throw new ForbiddenError("Offer not available");
    }

    return offer;
  } catch (err) {
    if (err.name === 'CastError') {
      throw new NotFoundError("Offer not found");
    }
    if (err instanceof NotFoundError || err instanceof ForbiddenError) {
      throw err;
    }
    throw err;
  }
}

export async function getOffers(filters) {
  const query = { available: true };

  if (filters.domain) query.domain = filters.domain;
  if (filters.city) query.city = filters.city;

  return await Offer.find(query);
}

export async function updateOffer(id, data) {
  try {
    const offer = await Offer.findById(id);

    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    const { title, link, city, domain, salary, startDate, endDate, available } = data;
    
    if (title !== undefined) offer.title = title;
    if (link !== undefined) offer.link = link;
    if (city !== undefined) offer.city = city;
    if (domain !== undefined) offer.domain = domain;
    if (salary !== undefined) offer.salary = salary;
    if (startDate !== undefined) offer.startDate = startDate;
    if (endDate !== undefined) offer.endDate = endDate;
    if (available !== undefined) offer.available = available;

    return await offer.save();
  } catch (err) {
    if (err.name === 'CastError') {
      throw new NotFoundError("Offer not found");
    }
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw err;
  }
}

export async function deleteOffer(id) {
  try {
    const offer = await Offer.findById(id);

    if (!offer) {
      throw new NotFoundError("Offer not found");
    }

    await Offer.findByIdAndDelete(id);
  } catch (err) {
    if (err.name === 'CastError') {
      throw new NotFoundError("Offer not found");
    }
    if (err instanceof NotFoundError) {
      throw err;
    }
    throw err;
  }
}

