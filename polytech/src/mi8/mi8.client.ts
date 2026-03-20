import path from "path";
import { fileURLToPath } from "url";
import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, "../../proto/news.proto");

const packageDef = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObject: any = grpc.loadPackageDefinition(packageDef);
const newsPackage = grpcObject.mi8;

const client = new newsPackage.NewsService(
  process.env.MI8_GRPC_URL || "localhost:50051",
  grpc.credentials.createInsecure()
);

export interface CityScore {
  safety: number;
  economy: number;
  qualityOfLife: number;
  culture: number;
  totalScore: number;
}

export interface CityScoreResponse {
  score?: CityScore;
}

export interface News {
  [key: string]: unknown;
}

export interface NewsResponse {
  news?: News[];
}

export function getCityScore(city: string): Promise<CityScore | null> {
  return new Promise((resolve, reject) => {
    client.GetCityScore({ city }, (err: Error | null, response?: CityScoreResponse) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response?.score ?? null);
    });
  });
}

export function getLatestNewsInCity(city: string, limit: number = 5): Promise<News[]> {
  return new Promise((resolve, reject) => {
    client.GetLatestNewsInCity({ city, limit }, (err: Error | null, response?: NewsResponse) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response?.news ?? []);
    });
  });
}
