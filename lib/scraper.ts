import axios from 'axios';
import * as cheerio from 'cheerio';
import { GoldType } from '@prisma/client';

export interface ScrapedPrice {
  type: GoldType;
  weight: number;
  priceBuy: number;
  priceSell: number;
}

const GOLD_TYPE_MAPPING: Record<string, GoldType> = {
  'HARGA ANTAM': GoldType.ANTAM,
  'HARGA UBS': GoldType.UBS,
  'HARGA GALERI 24': GoldType.GALERI24,
};

export async function scrapeGoldPrices(): Promise<ScrapedPrice[]> {
  try {
    const { data } = await axios.get('https://galeri24.co.id/harga-emas', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(data);
    const results: ScrapedPrice[] = [];

    // The site has headers like "Harga ANTAM", "Harga UBS", "Harga GALERI 24"
    $('div.bg-primary-100.font-medium.text-center').each((_, element) => {
      const headerText = $(element).text().toUpperCase();
      let matchedType: GoldType | null = null;

      for (const [key, value] of Object.entries(GOLD_TYPE_MAPPING)) {
        if (headerText.trim() === key) {
          matchedType = value;
          break;
        }
      }

      if (matchedType) {
        // The table is usually the next sibling
        const table = $(element).next();
        table.find('.grid.grid-cols-5').each((index, row) => {
          // Skip header row
          if (index === 0) return;

          const cols = $(row).find('div');
          if (cols.length >= 3) {
            const weightStr = $(cols[0]).text().trim().replace(',', '.').replace(/[^\d.]/g, '');
            const priceBuyStr = $(cols[1]).text().trim().replace(/[^\d]/g, '');
            const priceSellStr = $(cols[2]).text().trim().replace(/[^\d]/g, '');

            const weight = parseFloat(weightStr);
            const priceBuy = parseFloat(priceBuyStr);
            const priceSell = parseFloat(priceSellStr);

            if (!isNaN(weight) && !isNaN(priceBuy)) {
              results.push({
                type: matchedType!,
                weight,
                priceBuy,
                priceSell: isNaN(priceSell) ? 0 : priceSell,
              });
            }
          }
        });
      }
    });

    return results;
  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}
