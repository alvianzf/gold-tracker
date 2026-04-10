import { scrapeGoldPrices } from '../lib/scraper';

async function test() {
  const data = await scrapeGoldPrices();
  console.log('Total scraped:', data.length);
  for (const d of data) {
    if (d.type === 'ANTAM' && d.weight === 1) {
      console.log(d);
    }
  }
}

test().catch(console.error);
