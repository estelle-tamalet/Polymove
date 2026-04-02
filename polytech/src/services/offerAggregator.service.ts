import axios from "axios";
import { getCityScore, getLatestNewsInCity, News, CityScore } from "../mi8/mi8.client.js";

export interface EnrichedOffer {
  [key: string]: unknown;
  cityScore?: CityScore | null;
  news?: News[];
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("Service timeout")), ms)
    )
  ]);
}

export async function getOffers(filters: any): Promise<EnrichedOffer[]> {
  let offers: any[] = [];
  try {
    const res = await axios.get(`${process.env.OFFER_SERVICE_URL}/offers`, { timeout: 2000 });
    offers = res.data;
  } catch (err) {
    console.error("Erasmumu unavailable");
    return [];
  }

  const enrichedOffers = await Promise.all(
    offers.map(async (offer) => {
      let cityScore: CityScore | null = null;
      let news: News[] = [];
      try {
        [cityScore, news] = await Promise.all([
          withTimeout(getCityScore(offer.city), 2000),
          withTimeout(getLatestNewsInCity(offer.city, 3), 2000)
        ]);
      } catch (err) {
        console.warn(`MI8 timeout/failure for ${offer.city}`);
      }
      return {
        ...offer,
        cityScore,
        news
      };
    })
  );

  return enrichedOffers;
}

export async function getAggregatedOffers(): Promise<EnrichedOffer[]> {
  return getOffers({});
}
