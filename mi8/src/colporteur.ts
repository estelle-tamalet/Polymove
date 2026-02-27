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

const news = {
  id: "3",
  title: "Innovation hub opens in Barcelona",
  city: "Barcelona",
  country: "Spain",
  content: "New tech center attracts startups",
  createdAt: Date.now(),
  tags: ["innovation", "entertainment"]
};

client.CreateNews(news, (err: any, response: any) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("News created:", news);
  console.log("\nGetting Barcelona score...");
  
  client.GetCityScore({ city: "Barcelona" }, (err: any, response: any) => {
    if (err) {
      console.error("Error getting score:", err);
      return;
    }
    console.log("Barcelona score:", response.score);
    process.exit(0);
  });
});
