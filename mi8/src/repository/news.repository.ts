export interface News {
  id: string;
  title: string;
  city: string;
  country: string;
  content: string;
  createdAt: number;
}

export class ArrayNewsRepository {
  private news: News[] = [
    {
      id: "1",
      title: "Tech boom in Berlin",
      city: "Berlin",
      country: "Germany",
      content: "Startups growing fast",
      createdAt: Date.now()
    },
    {
      id: "2",
      title: "Paris cultural festival",
      city: "Paris",
      country: "France",
      content: "Big cultural event",
      createdAt: Date.now()
    }
  ];

  getLatestNews(limit: number): News[] {
    return this.news
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }

  getLatestNewsInCity(city: string, limit: number): News[] {
    return this.news
      .filter(n => n.city.toLowerCase() === city.toLowerCase())
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);
  }
}
