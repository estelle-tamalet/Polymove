import * as fs from 'fs';
import * as path from 'path';
import { RabbitMQService } from './services/rabbitmq.service';

interface News {
  id: string;
  title: string;
  city: string;
  country: string;
  content: string;
  tags: string[];
}

async function publishNews(): Promise<void> {
  const rabbitmq = new RabbitMQService({
    url: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
    exchange: 'news_exchange',
    queue: 'news.created',
    routingKey: 'news.created'
  });

  try {
    await rabbitmq.connect();

    // Load news from JSON file
    const newsFilePath = path.join(__dirname, '..', 'news.json');
    const newsData: News[] = JSON.parse(fs.readFileSync(newsFilePath, 'utf-8'));

    console.log(`Publishing ${newsData.length} news items to RabbitMQ...`);

    for (const news of newsData) {
      await rabbitmq.publish(news);
      console.log(`Published: ${news.title} (${news.city})`);
    }

    console.log('All news published successfully');
    await rabbitmq.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error publishing news:', err);
    process.exit(1);
  }
}

publishNews();

