import path from "path";
import { fileURLToPath } from "url";
import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const protoPath = path.join(__dirname, "../../proto/news.proto");

const packageDef = protoLoader.loadSync(protoPath, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObject = grpc.loadPackageDefinition(packageDef);
const newsPackage = grpcObject.mi8;

const client = new newsPackage.NewsService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

export function getLatestNews(limit = 5) {
  client.GetLatestNews({ limit }, (err, response) => {
    if (err) {
      console.error("gRPC error:", err);
      return;
    }

    console.log("Latest news from MI8:");
    console.log(response.news);
  });
}
