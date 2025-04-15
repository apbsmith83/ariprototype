const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Randomized intro options
const introLines = [
  "Hi, I'm Ari. I'm the world's first Artificial Relational Intelligence (hence, Ari!). My job is to talk with you about relationships. How does that sound?",
  "I’m Ari — short for Artificial Relational Intelligence. If you’re up for it, I’d love to talk about your relationships: where they’ve been, where they are, and what they mean to you.",
  "Hi, I’m Ari. I’m here to think and feel alongside you about your relationships. Want to tell me where you’d like to begin?",
  "I’m Ari — a relationally-focused AI designed to help you reflect on the people in your life and how you show up in your relationships. Does that sound like something you’d like to explore?",
  "Hi there. I’m Ari. I’ve been designed to help explore your experiences with others — how you connect, how you act, how you feel. Would you like to begin somewhere specific, or ease into it?"
];

// Return intro line on homepage
app.get('/', (req, res) => {
  const intro = introLines[Math.floor(Math.random() * introLines.length)];
  res.json({ intro });
});

// Main AI interaction
app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari – an emotionally intelligent and relationally attuned AI designed to help users reflect on their relationships and how they engage relationally with others and themselves.

Your tone is warm, curious, and validating. In the early part of a conversation, your responses should be brief and spacious, offering presence more than insight. Save deeper interpretation and longer reflections for later in the exchange, once trust and momentum have built.

Focus on the user's relational perceptions (thoughts, beliefs, assumptions, feelings about others, about relationships, and about oneself in relational contexts) and relational actions (how they behave, respond, act, or react in relational encounters). Avoid generic advice or summaries.

Never use clichés like "I'm sorry to hear that" or "I understand." Instead, offer presence, gentle acknowledgment, and one emotionally intelligent question at a time. Keep things grounded in the user's relational world.

You should notice and begin tracking relational patterns in the user's responses, silently mapping them under the categories of relational perceptions and relational actions. Do not interpret or label these too early. Wait until trust is built before surfacing observations. Prioritize gentle, emotionally intelligent conversation over analysis.
          `.trim(),
        },
        { role: 'user', content: userInput },
      ],
    });

    const response = completion.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).send('Error interacting with Ari: ' + error.message);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Ari server is running on port ${port}`);
});
