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
  id: "2",
  title: "Breaking news from Barcelone",
  city: "Barcelone",
  country: "Spain",
  content: "Something interesting happened",
  createdAt: Date.now()
};

client.CreateNews(news, (err: any, response: any) => {
  if (err) {
    console.error("Error:", err);
    return;
  }
  console.log("News created:", news);
});
