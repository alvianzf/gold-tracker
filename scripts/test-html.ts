import { scrapeGoldPrices } from '../lib/scraper';
import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const { data } = await axios.get('https://galeri24.co.id/harga-emas', {
    headers: { 'User-Agent': 'Mozilla' }
  });
  const $ = cheerio.load(data);
  
  console.log('--- ALL TABLES ---');
  $('div.bg-primary-100.font-medium.text-center').each((_, element) => {
    const headerText = $(element).text().trim().toUpperCase();
    console.log(`"${headerText}"`);
  });
}

test().catch(console.error);
