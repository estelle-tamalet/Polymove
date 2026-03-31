import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { RedisNewsRepository } from "./repository/news.repository";
import { CityScoreRepository } from "./repository/cityScore.repository";
import { CityStatsRepository } from "./repository/cityStats.repository";
import { RabbitMQService } from "./services/rabbitmq.service";

const packageDef = protoLoader.loadSync("proto/news.proto", {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObject: any = grpc.loadPackageDefinition(packageDef);
const newsPackage = grpcObject.mi8;
const newsRepo = new RedisNewsRepository();
const cityScoreRepo = new CityScoreRepository();
const cityStatsRepo = new CityStatsRepository();

// RabbitMQ service for news.created events
const rabbitmq = new RabbitMQService({
  url: process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672',
  exchange: 'news_exchange',
  queue: 'news.created',
  routingKey: 'news.created'
});

const newsService = {
  GetLatestNews: async (call: any, callback: any) => {
    const news = await newsRepo.getLatestNews(call.request.limit);
    callback(null, { news });
  },

  GetLatestNewsInCity: async (call: any, callback: any) => {
    const { city, limit } = call.request;
    const news = await newsRepo.getLatestNewsInCity(city, limit);
    callback(null, { news });
  },

  GetCityScore: async (call: any, callback: any) => {
    const score = await cityScoreRepo.getCityScore(call.request.city);
    callback(null, { score });
  },

  GetTopCities: async (call: any, callback: any) => {
    const scores = await cityScoreRepo.getTopCities(call.request.limit);
    callback(null, { scores });
  },

  GetCityStats: async (call: any, callback: any) => {
    const stats = await cityStatsRepo.getCityStats(call.request.city);
    callback(null, { stats });
  }
};

// Handler for news.created RabbitMQ events
async function handleNewsCreated(msg: any): Promise<void> {
  const news = JSON.parse(msg.content.toString());
  
  await newsRepo.createNews({
    id: news.id,
    title: news.title,
    city: news.city,
    country: news.country,
    content: news.content,
    createdAt: news.createdAt || Date.now(),
    tags: news.tags || []
  });

  await cityScoreRepo.updateCityScore(news.city, news.tags || []);
  
  console.log(`[RabbitMQ] News created and stored: ${news.title} (${news.city})`);
}

// Handler for offer.created RabbitMQ events
async function handleOfferCreated(msg: any): Promise<void> {
  const offer = JSON.parse(msg.content.toString());

  await cityStatsRepo.incrementOfferCount(offer.city, offer.domain);

  console.log(`[RabbitMQ] Offer created: ${offer.title} in ${offer.city} (${offer.domain})`);
}

async function startServer(): Promise<void> {
  try {
    await Promise.all([newsRepo.connect(), cityScoreRepo.connect(), cityStatsRepo.connect()]);

    // RabbitMQ for news.created
    const newsRabbitmq = new RabbitMQService({
      url: process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672',
      exchange: 'news_exchange',
      queue: 'mi8.news.created',
      routingKey: 'news.created'
    });

    await newsRabbitmq.connect();
    await newsRabbitmq.subscribe(handleNewsCreated);

    // RabbitMQ for offer.created
    const offerRabbitmq = new RabbitMQService({
      url: process.env.RABBITMQ_URL || 'amqp://admin:admin@rabbitmq:5672',
      exchange: 'offers_exchange',
      queue: 'mi8.offer.created',
      routingKey: 'offer.created'
    });

    await offerRabbitmq.connect();
    await offerRabbitmq.subscribe(handleOfferCreated);

    const server = new grpc.Server();
    server.addService(newsPackage.NewsService.service, newsService);

    server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (error) => {
      if (error) throw error;
      console.log("✓ MI8 gRPC server running on port 50051");
      console.log("✓ MI8 subscribed to RabbitMQ topics: news.created, offer.created");
    });
  } catch (err) {
    console.error("Failed to start MI8 server:", err);
    process.exit(1);
  }
}

startServer();
