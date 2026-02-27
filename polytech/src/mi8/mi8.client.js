import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

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

const grpcObject = grpc.loadPackageDefinition(packageDef);
const newsPackage = grpcObject.mi8;

const client = new newsPackage.NewsService(
  process.env.MI8_GRPC_URL || "localhost:50051",
  grpc.credentials.createInsecure()
);

export function getCityScore(city) {
  return new Promise((resolve, reject) => {
    client.GetCityScore({ city }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response?.score ?? null);
    });
  });
}

export function getLatestNewsInCity(city, limit = 5) {
  return new Promise((resolve, reject) => {
    client.GetLatestNewsInCity({ city, limit }, (err, response) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(response?.news ?? []);
    });
  });
}
