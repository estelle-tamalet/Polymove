import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import * as amqp from 'amqplib';
import { RedisNewsRepository } from "./repository/news.repository";
import { CityScoreRepository } from "./repository/cityScore.repository";
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
  }
};

// Handler for news.created RabbitMQ events
async function handleNewsCreated(msg: amqp.Message): Promise<void> {
  const news = JSON.parse(msg.content.toString());
  
  // Store news in Redis
  await newsRepo.createNews({
    id: news.id,
    title: news.title,
    city: news.city,
    country: news.country,
    content: news.content,
    createdAt: news.createdAt || Date.now(),
    tags: news.tags || []
  });

  // Update city score based on news tags
  await cityScoreRepo.updateCityScore(news.city, news.tags || []);
  
  console.log(`[RabbitMQ] News created and stored: ${news.title} (${news.city})`);
}

async function startServer(): Promise<void> {
  try {
    // Connect repositories
    await Promise.all([newsRepo.connect(), cityScoreRepo.connect()]);

    // Connect to RabbitMQ and subscribe to news.created topic
    await rabbitmq.connect();
    await rabbitmq.subscribe(handleNewsCreated);

    // Start gRPC server for polytech communication
    const server = new grpc.Server();
    server.addService(newsPackage.NewsService.service, newsService);

    server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (error) => {
      if (error) throw error;
      console.log("MI8 gRPC server running on port 50051");
      console.log("MI8 subscribed to RabbitMQ topic: news.created");
    });
  } catch (err) {
    console.error("Failed to start MI8 server:", err);
    process.exit(1);
  }
}

startServer();
