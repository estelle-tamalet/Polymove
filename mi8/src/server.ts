import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import { ArrayNewsRepository } from "./repository/news.repository";

const packageDef = protoLoader.loadSync("proto/news.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObject: any = grpc.loadPackageDefinition(packageDef);
const newsPackage = grpcObject.mi8;

const repo = new ArrayNewsRepository();

const newsService = {
  GetLatestNews: (call: any, callback: any) => {
    const limit = call.request.limit;
    const news = repo.getLatestNews(limit);
    callback(null, { news });
  },

  GetLatestNewsInCity: (call: any, callback: any) => {
    const { city, limit } = call.request;
    const news = repo.getLatestNewsInCity(city, limit);
    callback(null, { news });
  }
};

const server = new grpc.Server();
server.addService(newsPackage.NewsService.service, newsService);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (error: Error | null) => {
    if (error) {
      console.error("Failed to bind MI8 gRPC server:", error);
      return;
    }
    console.log("MI8 gRPC server running on port 50051");
  }
);
