import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { RedisNewsRepository } from "./repository/news.repository";
import { CityScoreRepository } from "./repository/cityScore.repository";

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

  CreateNews: async (call: any, callback: any) => {
    await newsRepo.createNews(call.request);
    await cityScoreRepo.updateCityScore(call.request.city, call.request.tags || []);
    callback(null, {});
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

const server = new grpc.Server();
server.addService(newsPackage.NewsService.service, newsService);

Promise.all([newsRepo.connect(), cityScoreRepo.connect()]).then(() => {
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) throw error;
    console.log("MI8 gRPC server running on port 50051");
  });
});
