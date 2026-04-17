import OpenAI from 'openai';

const apiKey = process.env.NEXT_AI_API_KEY;

if (!apiKey) {
  console.warn('NEXT_AI_API_KEY is not defined in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey || '',
  baseURL: 'https://ai.sumopod.com/v1',
});

export async function generateFinancialSuggestion(transactions: any[]) {
  // Construct a concise summary of transactions for the AI
  const summary = transactions.length > 0 
    ? transactions.map(t => `${t.type}: ${t.amount} for ${t.purpose}`).join(', ')
    : 'No transactions yet';

  const prompt = `Based on these recent transactions: [${summary}], provide a snappy, helpful, 1-sentence financial insight or tip for the user. Be concise and actionable. Tone should be friendly but expert. If no transactions, encourage them to start tracking.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'mimo-v2-pro',
      messages: [
        { role: 'system', content: 'You are a professional financial advisor specializing in snappy, category-aware spending analysis.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('AI Suggestion Error:', error);
    return 'Track your spending today to get personalized AI insights tomorrow!';
  }
}
