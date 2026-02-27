import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("proto/news.proto", {
  keepCase: true,
  longs: Number,
  enums: String,
  defaults: true,
  oneofs: true
});

const grpcObject: any = grpc.loadPackageDefinition(packageDef);
const newsPackage = grpcObject.mi8;

const client = new newsPackage.NewsService(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

client.GetTopCities({ limit: 10 }, (err: any, response: any) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  
  console.log("=== TOP CITIES RANKING ===\n");
  response.scores.forEach((city: any, index: number) => {
    console.log(`${index + 1}. ${city.city.toUpperCase()} - Total: ${city.totalScore}`);
    console.log(`   Safety: ${city.safety}, Economy: ${city.economy}, Quality: ${city.qualityOfLife}, Culture: ${city.culture}\n`);
  });
  
  process.exit(0);
});
