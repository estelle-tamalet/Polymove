import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { RedisNewsRepository } from "./repository/news.repository";

const packageDef = protoLoader.loadSync("proto/news.proto", {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObject: any = grpc.loadPackageDefinition(packageDef);
const newsPackage = grpcObject.mi8;
const repo = new RedisNewsRepository();

const newsService = {
  GetLatestNews: async (call: any, callback: any) => {
    const news = await repo.getLatestNews(call.request.limit);
    callback(null, { news });
  },

  GetLatestNewsInCity: async (call: any, callback: any) => {
    const { city, limit } = call.request;
    const news = await repo.getLatestNewsInCity(city, limit);
    callback(null, { news });
  },

  CreateNews: async (call: any, callback: any) => {
    await repo.createNews(call.request);
    callback(null, {});
  }
};

const server = new grpc.Server();
server.addService(newsPackage.NewsService.service, newsService);

repo.connect().then(() => {
  server.bindAsync("0.0.0.0:50051", grpc.ServerCredentials.createInsecure(), (error) => {
    if (error) throw error;
    console.log("MI8 gRPC server running on port 50051");
  });
});
