import { CityScoreRepository } from './repository/cityScore.repository';

async function main() {
  const repo = new CityScoreRepository();
  await repo.connect();

  console.log('=== Getting initial scores ===');
  const paris = await repo.getCityScore('Paris');
  console.log('Paris:', paris);

  const barcelona = await repo.getCityScore('Barcelona');
  console.log('Barcelona:', barcelona);

  console.log('\n=== Updating Paris with negative news ===');
  await repo.updateCityScore('Paris', ['crime', 'pollution', 'unemployment']);
  const parisUpdated = await repo.getCityScore('Paris');
  console.log('Paris after update:', parisUpdated);

  console.log('\n=== Updating Barcelona with positive news ===');
  await repo.updateCityScore('Barcelona', ['festival', 'investment', 'education']);
  const barcelonaUpdated = await repo.getCityScore('Barcelona');
  console.log('Barcelona after update:', barcelonaUpdated);

  console.log('\n=== Adding more cities ===');
  await repo.updateCityScore('Madrid', ['tourism', 'jobs', 'museum']);
  await repo.updateCityScore('Lyon', ['cleanliness', 'health']);

  console.log('\n=== Top 5 Cities ===');
  const topCities = await repo.getTopCities(5);
  topCities.forEach((city, index) => {
    console.log(`${index + 1}. ${city.city}: ${city.totalScore} points`);
  });

  process.exit(0);
}

main();
