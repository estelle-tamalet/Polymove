import { createClient, RedisClientType } from 'redis';

export interface CityStats {
  city: string;
  totalOffers: number;
  offersByDomain: { [domain: string]: number };
  lastOfferDate: number;
}

export class CityStatsRepository {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async getCityStats(city: string): Promise<CityStats> {
    const normalizedCity = city.toLowerCase();
    const key = `city:${normalizedCity}:stats`;
    const data = await this.client.hGetAll(key);

    if (!data.totalOffers) {
      const defaultStats: CityStats = {
        city: normalizedCity,
        totalOffers: 0,
        offersByDomain: {},
        lastOfferDate: 0
      };

      await this.client.hSet(key, {
        totalOffers: '0',
        lastOfferDate: '0'
      });

      return defaultStats;
    }

    const domainData = await this.client.get(`city:${normalizedCity}:domains`);
    const offersByDomain = domainData ? JSON.parse(domainData) : {};

    return {
      city: normalizedCity,
      totalOffers: parseInt(data.totalOffers),
      offersByDomain,
      lastOfferDate: parseInt(data.lastOfferDate)
    };
  }

  async incrementOfferCount(city: string, domain: string): Promise<void> {
    const normalizedCity = city.toLowerCase();
    const statsKey = `city:${normalizedCity}:stats`;
    const domainKey = `city:${normalizedCity}:domains`;

    await this.client.hIncrBy(statsKey, 'totalOffers', 1);
    await this.client.hSet(statsKey, { lastOfferDate: Date.now().toString() });

    const domainData = await this.client.get(domainKey);
    const offersByDomain = domainData ? JSON.parse(domainData) : {};

    offersByDomain[domain] = (offersByDomain[domain] || 0) + 1;
    await this.client.set(domainKey, JSON.stringify(offersByDomain));
  }
}
