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

async function testCityScoring() {
  console.log("=== Testing City Scoring System ===\n");

  console.log("1. Creating news with positive tags in Paris");
  await new Promise((resolve, reject) => {
    client.CreateNews({
      id: "news1",
      title: "Paris hosts innovation summit",
      city: "Paris",
      country: "France",
      content: "Major tech companies gather",
      createdAt: Date.now(),
      tags: ["innovation", "culture"]
    }, (err: any) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
  console.log("✓ News created\n");

  console.log("2. Getting Paris score");
  const parisScore: any = await new Promise((resolve, reject) => {
    client.GetCityScore({ city: "Paris" }, (err: any, response: any) => {
      if (err) reject(err);
      else resolve(response.score);
    });
  });
  console.log("Paris score:", parisScore);
  console.log(`Total: ${parisScore.totalScore} (Safety: ${parisScore.safety}, Economy: ${parisScore.economy}, Quality: ${parisScore.qualityOfLife}, Culture: ${parisScore.culture})\n`);

  console.log("3. Creating crisis news in Barcelona");
  await new Promise((resolve, reject) => {
    client.CreateNews({
      id: "news2",
      title: "Economic crisis hits Barcelona",
      city: "Barcelona",
      country: "Spain",
      content: "Recession fears",
      createdAt: Date.now(),
      tags: ["crisis", "crime"]
    }, (err: any) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
  console.log("✓ News created\n");

  console.log("4. Creating positive healthcare news in Lyon");
  await new Promise((resolve, reject) => {
    client.CreateNews({
      id: "news3",
      title: "New hospital opens in Lyon",
      city: "Lyon",
      country: "France",
      content: "State-of-the-art facility",
      createdAt: Date.now(),
      tags: ["healthcare", "innovation"]
    }, (err: any) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
  console.log("✓ News created\n");

  console.log("5. Creating disaster news in Madrid");
  await new Promise((resolve, reject) => {
    client.CreateNews({
      id: "news4",
      title: "Flood in Madrid",
      city: "Madrid",
      country: "Spain",
      content: "Heavy rains cause damage",
      createdAt: Date.now(),
      tags: ["disaster"]
    }, (err: any) => {
      if (err) reject(err);
      else resolve(null);
    });
  });
  console.log("✓ News created\n");

  console.log("6. Getting Barcelona score");
  const barcelonaScore: any = await new Promise((resolve, reject) => {
    client.GetCityScore({ city: "Barcelona" }, (err: any, response: any) => {
      if (err) reject(err);
      else resolve(response.score);
    });
  });
  console.log("Barcelona score:", barcelonaScore);
  console.log(`Total: ${barcelonaScore.totalScore}\n`);

  console.log("7. Getting Top 5 Cities");
  const topCities: any = await new Promise((resolve, reject) => {
    client.GetTopCities({ limit: 5 }, (err: any, response: any) => {
      if (err) reject(err);
      else resolve(response.scores);
    });
  });
  
  console.log("\n=== City Rankings ===");
  topCities.forEach((city: any, index: number) => {
    console.log(`${index + 1}. ${city.city.toUpperCase()}`);
    console.log(`   Total Score: ${city.totalScore}`);
    console.log(`   Safety: ${city.safety}, Economy: ${city.economy}, Quality: ${city.qualityOfLife}, Culture: ${city.culture}`);
  });

  console.log("\n=== Test completed successfully ===");
  process.exit(0);
}

testCityScoring().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
