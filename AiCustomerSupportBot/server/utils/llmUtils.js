const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
dotenv.config();

const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
const openai = new OpenAIApi(configuration);

async function generateLLMResponse(userQuery, history, FAQs) {
  const historyString = history.map(msg => `${msg.userMessage} - Bot: ${msg.botResponse}`).join('\n');
  const faqsString = JSON.stringify(FAQs); // Convert to string for prompt

  const prompt = `
    You are a helpful customer support bot. Use the following FAQs: ${faqsString}

    Conversation history: ${historyString}

    User query: ${userQuery}

    Respond accurately based on the FAQs. If the query isn't covered, suggest escalation by saying: 'I need to escalate this to a human agent.' Summarize the conversation at the end and suggest next actions if needed.

    Response format: Keep it concise, under 150 words.
  `;

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
    });

    const response = completion.data.choices[0].message.content;
    
    // Parse response for escalation (simple keyword check)
    const escalation = response.toLowerCase().includes('escalate');

    // Extract summary (assume it's in the response; in a real app, use regex)
    const summaryMatch = response.match(/Summary: (.*)/i);
    const summary = summaryMatch ? summaryMatch[1] : 'No summary available';

    return { response, summary, escalation };
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to generate response');
  }
}

module.exports = { generateLLMResponse };