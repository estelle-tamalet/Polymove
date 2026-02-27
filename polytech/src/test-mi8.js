import { getCityScore, getLatestNewsInCity } from "./mi8/mi8.client.js";

async function testCityScore() {
  try {
    console.log("Testing getCityScore...");
    const score = await getCityScore("Paris");
    console.log("City Score:", score);
  } catch (err) {
    console.error("Error getting city score:", err.message);
  }
}

async function testLatestNews() {
  try {
    console.log("\nTesting getLatestNewsInCity...");
    const news = await getLatestNewsInCity("Paris", 5);
    console.log("Latest news:", news);
  } catch (err) {
    console.error("Error getting news:", err.message);
  }
}

(async () => {
  await testCityScore();
  await testLatestNews();
})();
