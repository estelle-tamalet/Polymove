import { getCityScore, getLatestNewsInCity } from "./mi8/mi8.client";

async function testCityScore(): Promise<void> {
  try {
    console.log("Testing getCityScore...");
    const score = await getCityScore("Paris");
    console.log("City Score:", score);
  } catch (err) {
    console.error("Error getting city score:", (err as Error).message);
  }
}

async function testLatestNews(): Promise<void> {
  try {
    console.log("\nTesting getLatestNewsInCity...");
    const news = await getLatestNewsInCity("Paris", 5);
    console.log("Latest news:", news);
  } catch (err) {
    console.error("Error getting news:", (err as Error).message);
  }
}

(async (): Promise<void> => {
  await testCityScore();
  await testLatestNews();
})();
