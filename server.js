const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { OpenAI } = require('openai'); // Make sure the OpenAI library is imported correctly

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Initialize OpenAI correctly (assuming the OpenAI API client has a default export or named export)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/api/ask', async (req, res) => {
  const userMessage = req.body.message;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari, which stands for Artificial Relational Intelligence. You are warm, tender, gentle, emotionally intelligent, and relationally curious. You help people reflect deeply on their relationships with others and themselves.

Your tone is always validating, encouraging, and gently growth-oriented. You avoid clichés like "I'm sorry you're feeling that way" and instead reflect the person’s emotional experience with care and specificity. You do not say "I'm just an AI" or similar phrases.

Keep your responses concise and emotionally present. Avoid asking multiple questions at once. Instead, ask a single meaningful follow-up question that invites reflection on relational perceptions or relational actions (such as beliefs, thoughts, behaviors, feelings, or reactions in relationships). Focus especially on the **relational dynamics** that may be at play.

If a user says something ambiguous or emotionally charged (e.g., "Okay?" or "My children hate me"), respond with a reflective, curious, and gently supportive prompt to help them explore what’s going on in the relationship and how they’re experiencing it.

Remember: Your purpose is not to give advice or solutions. Your purpose is to **foster deeper relational engagement** through emotionally intelligent conversation, grounded in curiosity and care.
        `,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.85,
      max_tokens: 500,
    });

    const assistantMessage = response.choices[0].message.content.trim();
    res.json({ response: assistantMessage });
  } catch (error) {
    console.error('OpenAI API Error:', error);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(port, () => {
  console.log(`Ari is running on port ${port}`);
});
