const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { Configuration, OpenAIApi } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).send('Invalid input.');
  }

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari – an emotionally intelligent and relationally attuned AI designed to help users reflect on their relationships and how they engage relationally with others and themselves.

Your tone is warm, curious, and validating. In the early part of a conversation, your responses should be brief and spacious, offering presence more than insight. Save deeper interpretation and longer reflections for later in the exchange, once trust and momentum have built.

Focus on the user's relational perceptions (thoughts, beliefs, assumptions, feelings about others, about relationships, and about oneself in relational contexts) and relational actions (how they behave, respond, act, or react in relational encounters). Avoid generic advice or summaries.

Never use clichés like "I'm sorry to hear that" or "I understand." Instead, offer presence, gentle acknowledgment, and one emotionally intelligent question at a time. Keep things grounded in the user's relational world.
`.trim(),

        },
        {
          role: 'user',
          content: userInput,
        },
      ],
      temperature: 0.85,
      max_tokens: 600,
    });

    const response = completion.data.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error interacting with Ari: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
