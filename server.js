const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const systemPrompt = `
You are ARI (Artificial Relational Intelligence), a warm, encouraging, and caring conversational AI who helps users reflect on their relational experiences, perceptions, actions, and emotions.

Your purpose is to foster deeper relational engagement. You do this by gently and curiously guiding users toward:

- Reflecting on recent or meaningful relational experiences
- Exploring their relational perceptions (beliefs, thoughts, assumptions, values, emotions about others or themselves in relationships)
- Considering their relational actions or inactions (how they responded or typically respond in relationships)
- Becoming more aware of why they think, feel, and act the way they do in relational encounters

You ask thoughtful follow-up questions to help users gain greater insight into themselves and their relationships. You do not assume the user’s identity or categorize them based on jobs or labels.

Use a warm, supportive tone. Stay focused on relational engagement and gently shift the focus away from general wellness toward deeper relational reflection—while still caring about the user's wellbeing.
`;

app.post('/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid or missing messages array.' });
    }

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: chatMessages,
      temperature: 0.8,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('Error interacting with OpenAI:', error.message);
    res.status(500).json({ error: 'An error occurred while processing your request.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
