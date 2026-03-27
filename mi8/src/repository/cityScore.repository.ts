import { createClient, RedisClientType } from 'redis';

export interface CityScore {
  city: string;
  safety: number;
  economy: number;
  qualityOfLife: number;
  culture: number;
  lastUpdated: number;
  totalScore: number;
}

const tagDeltas: { [key: string]: { safety: number, economy: number, qualityOfLife: number, culture: number } } = {
  'innovation': { safety: 20, economy: 60, qualityOfLife: 30, culture: 5 },
  'culture': { safety: 0, economy: 15, qualityOfLife: 40, culture: 75 },
  'healthcare': { safety: 30, economy: 20, qualityOfLife: 30, culture: 0 },
  'entertainment': { safety: 0, economy: 20, qualityOfLife: 25, culture: 35 },
  'crisis': { safety: -80, economy: -100, qualityOfLife: -60, culture: -30 },
  'crime': { safety: -120, economy: -50, qualityOfLife: -80, culture: -40 },
  'disaster': { safety: -100, economy: -70, qualityOfLife: -90, culture: -30 }
};

export class CityScoreRepository {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: process.env.REDIS_URL || 'redis://redis:6379' });
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async getCityScore(city: string): Promise<CityScore> {
    const normalizedCity = city.toLowerCase();
    const key = `city:${normalizedCity}:score`;
    const data = await this.client.hGetAll(key);

    if (!data.safety) {
      const defaultScore: CityScore = {
        city: normalizedCity,
        safety: 1000,
        economy: 1000,
        qualityOfLife: 1000,
        culture: 1000,
        lastUpdated: Date.now(),
        totalScore: 4000
      };
      
      await this.client.hSet(key, {
        safety: defaultScore.safety.toString(),
        economy: defaultScore.economy.toString(),
        qualityOfLife: defaultScore.qualityOfLife.toString(),
        culture: defaultScore.culture.toString(),
        lastUpdated: defaultScore.lastUpdated.toString()
      });

      await this.client.zAdd('city:ranking', { score: defaultScore.totalScore, value: normalizedCity });

      return defaultScore;
    }

    const safety = parseInt(data.safety);
    const economy = parseInt(data.economy);
    const qualityOfLife = parseInt(data.qualityOfLife);
    const culture = parseInt(data.culture);
    const totalScore = safety + economy + qualityOfLife + culture;

    return {
      city: normalizedCity,
      safety,
      economy,
      qualityOfLife,
      culture,
      lastUpdated: parseInt(data.lastUpdated),
      totalScore
    };
  }

  async updateCityScore(city: string, tags: string[]): Promise<CityScore> {
    const currentScore = await this.getCityScore(city);
    const normalizedCity = city.toLowerCase();
    const key = `city:${normalizedCity}:score`;

    for (const tag of tags) {
      const deltas = tagDeltas[tag.toLowerCase()];
      if (deltas) {
        currentScore.safety = Math.max(0, currentScore.safety + deltas.safety);
        currentScore.economy = Math.max(0, currentScore.economy + deltas.economy);
        currentScore.qualityOfLife = Math.max(0, currentScore.qualityOfLife + deltas.qualityOfLife);
        currentScore.culture = Math.max(0, currentScore.culture + deltas.culture);
      }
    }

    currentScore.lastUpdated = Date.now();
    currentScore.totalScore = currentScore.safety + currentScore.economy + currentScore.qualityOfLife + currentScore.culture;

    await this.client.hSet(key, {
      safety: currentScore.safety.toString(),
      economy: currentScore.economy.toString(),
      qualityOfLife: currentScore.qualityOfLife.toString(),
      culture: currentScore.culture.toString(),
      lastUpdated: currentScore.lastUpdated.toString()
    });

    await this.client.zAdd('city:ranking', { score: currentScore.totalScore, value: normalizedCity });

    return currentScore;
  }

  async getTopCities(limit: number): Promise<CityScore[]> {
    const results = await this.client.zRangeWithScores('city:ranking', 0, limit - 1, { REV: true });
    
    const cities: CityScore[] = [];
    for (const item of results) {
      const cityScore = await this.getCityScore(item.value);
      cities.push(cityScore);
    }
    
    return cities;
  }
}
