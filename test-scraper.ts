import { scrapeGoldPrices } from './lib/scraper';

async function test() {
  console.log('Testing scraper...');
  try {
    const data = await scrapeGoldPrices();
    console.log(JSON.stringify(data, null, 2));
    console.log(`Scraped ${data.length} records.`);
  } catch (error) {
    console.error('Error:', error);
  }
}

test();
