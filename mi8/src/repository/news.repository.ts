import { createClient, RedisClientType } from 'redis';

export interface News {
  id: string;
  title: string;
  city: string;
  country: string;
  content: string;
  createdAt: number;
}

export class RedisNewsRepository {
  private client: RedisClientType;

  constructor() {
    this.client = createClient({ url: 'redis://localhost:6379' });
    this.client.on('error', (err) => console.error('Redis error:', err));
  }

  async connect(): Promise<void> {
    await this.client.connect();
  }

  async createNews(news: News): Promise<void> {
    await this.client.hSet(`news:${news.id}`, {
      id: news.id,
      title: news.title,
      city: news.city,
      country: news.country,
      content: news.content,
      createdAt: news.createdAt.toString()
    });

    await this.client.zAdd('news:latest', {
      score: news.createdAt,
      value: news.id
    });

    await this.client.zAdd(`news:city:${news.city.toLowerCase()}`, {
      score: news.createdAt,
      value: news.id
    });
  }

  async getLatestNews(limit: number): Promise<News[]> {
    const ids = await this.client.zRange('news:latest', 0, limit - 1, { REV: true });
    return this.fetchNewsByIds(ids);
  }

  async getLatestNewsInCity(city: string, limit: number): Promise<News[]> {
    const ids = await this.client.zRange(`news:city:${city.toLowerCase()}`, 0, limit - 1, { REV: true });
    return this.fetchNewsByIds(ids);
  }

  private async fetchNewsByIds(ids: string[]): Promise<News[]> {
    const newsList: News[] = [];
    for (const id of ids) {
      const data = await this.client.hGetAll(`news:${id}`);
      if (data.id) {
        newsList.push({
          id: data.id,
          title: data.title,
          city: data.city,
          country: data.country,
          content: data.content,
          createdAt: parseInt(data.createdAt)
        });
      }
    }
    return newsList;
  }
}
