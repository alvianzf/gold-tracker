import axios from 'axios';
import * as cheerio from 'cheerio';

async function testHtml() {
  const { data } = await axios.get('https://galeri24.co.id/harga-emas', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  });
  const $ = cheerio.load(data);
  const element = $('div.bg-primary-100.font-medium.text-center').first();
  console.log('Header text:', $(element).text().toUpperCase());
  
  const table = $(element).next();
  table.find('.grid.grid-cols-5').each((index, row) => {
    if (index === 0 || index === 1) { // print first row (ignore header 0, so print 1)
      const cols = $(row).find('div');
      console.log('Cols html array:');
      cols.each((i, col) => {
         console.log(`Col ${i}: ${$(col).html()}`);
         console.log(`Col ${i} text: ${$(col).text()}`);
      });
    }
  });
}

testHtml();
