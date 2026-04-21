import OpenAI from 'openai';

const apiKey = process.env.NEXT_AI_API_KEY;

if (!apiKey) {
  console.warn('NEXT_AI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
  //@ts-ignore - Using SumoPod AI proxy
  baseURL: 'https://ai.sumopod.com/v1',
});

export async function generateFinancialSuggestion(transactions: any[]) {
  // Construct a concise summary of transactions for the AI
  const txSummary = transactions.length > 0
    ? transactions.map(t => `${t.type}: ${t.amount} for ${t.purpose}`).join(', ')
    : 'No recent finance transactions';

  const prompt = `
    Analyze the following recent finance transactions: [${txSummary}]

    Provide your response strictly in the following flow:
    1. Financial Health Status: Provide a rapid, objective status (e.g., "Status: Bleeding Cash", "Status: Stable", "Status: Thriving") based on the ratio of income vs expenses.
    2. Snarky Observation: A witty, brutally honest, and slightly sarcastic 1-sentence observation about their specific spending habits or income.
    3. Actionable Advice: A clear, serious, and practical piece of financial advice or budgeting tip to improve their situation (1 sentence).
    
    Keep the entire response very concise (max 3 sentences total). If no data is available, sarcastically remind them that you can't analyze a ghost town and to start logging their transactions.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gemini/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are Mimo, an elite, highly competent, but delightfully snarky AI financial advisor embedded in a premium portfolio tracking system called VaultCore.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.8
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return 'Track your daily expenses today to get personalized budgeting advice tomorrow!';
  }
}
