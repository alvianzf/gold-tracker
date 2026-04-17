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
    Based on the following recent finance transactions: [${txSummary}]

    Provide a professional financial advisor's response focused strictly on budgeting and spending habits:
    - A snappy, helpful 1-sentence insight about the user's spending or income.
    - A clear, actionable piece of financial advice or a budgeting tip (1 sentence).
    
    The response should be concise (max 2 sentences), friendly, and expert. If no data is available, encourage them to start tracking their daily expenses.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: 'gemini/gemini-2.5-flash',
      messages: [
        { role: 'system', content: 'You are a professional financial advisor specializing in personal finance tracking and budgeting.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return 'Track your daily expenses today to get personalized budgeting advice tomorrow!';
  }
}
