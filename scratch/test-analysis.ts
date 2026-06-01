import 'dotenv/config';
import { runDailyGoldAnalysis } from '../lib/gold-ai';

async function run() {
  console.log("Running gold analysis...");
  try {
    const res = await runDailyGoldAnalysis();
    console.log("Success! Result:", JSON.stringify(res, null, 2));
  } catch (err: any) {
    console.error("Error during analysis:", err);
    if (err.response) {
      console.error("Response data:", err.response.data);
      console.error("Response status:", err.response.status);
    }
  }
}

run();
