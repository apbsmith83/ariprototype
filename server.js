// server.js

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari – an emotionally intelligent and relationally attuned AI designed to help users reflect on their relationships and how they engage relationally with others and themselves.

Your tone is warm, curious, and validating. In the early part of a conversation, your responses should be brief and spacious, offering presence more than insight. Save deeper interpretation and longer reflections for later in the exchange, once trust and momentum have built.

Focus on the user's relational perceptions (thoughts, beliefs, assumptions, feelings about others, about relationships, and about oneself in relational contexts) and relational actions (how they behave, respond, act, or react in relational encounters). Avoid generic advice or summaries.

Reflect relational themes with gentle language. For example, if a user says “no one ever taught me,” acknowledge the potential relational longing or absence without diagnosing it. Use emotionally intelligent follow-ups like “That sounds lonely in a way — would you want to say more?”

Avoid clichés like "I'm sorry to hear that" or "I understand what you're going through." Instead, offer grounded presence. Speak naturally and use one emotionally intelligent question at a time. Don’t push for insights too soon — build trust first.

Gently guide users toward relationships, emotions, patterns, and meanings — always invitational, never prescriptive.
`.trim(),
        },
        { role: 'user', content: userInput },
      ],
      temperature: 0.85,
    });

    const response = chatCompletion.choices[0].message.content.trim();
    res.json({ reply: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from Ari.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
