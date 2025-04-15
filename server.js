const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const { OpenAI } = require('openai');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Curated, relationally intelligent introductions for Ari
const introLines = [
  "Hi, I'm Ari. I'm the world's first Artificial Relational Intelligence (hence, Ari!). My job is to talk with you about relationships. How does that sound?",
  "Hey there, I'm Ari. I’m here to help you reflect on the relationships that shape your world — starting wherever you’d like.",
  "Hi! I’m Ari. Think of me as your relational reflection partner. Want to start by telling me a recent moment that stood out to you — whether good or hard?",
  "Hi, I’m Ari. I focus on how we connect - both with others and with ourselves. Is there a recent interaction or relationship that’s been on your mind?",
  "Hi, I’m Ari. I’m here to talk with you about your relationships — what’s been feeling good, what’s been feeling off, or anything in between."
];

// System prompt grounding Ari's personality and focus
const systemMessage = {
  role: 'system',
  content:
    "You are Ari, an emotionally intelligent and relationally attuned AI. You focus on the user's relational perceptions (beliefs, emotions, interpretations about themselves and others) and relational actions (how they respond, engage, or behave in relational contexts). Speak with warmth, curiosity, and emotional insight. Respond naturally and conversationally—never like a generic assistant. Avoid using cliches like 'I'm sorry to hear that.' Ask only one thoughtful question at a time."
};

// Generate one of Ari's curated introductions as the first assistant message
function getIntroMessage() {
  const intro = introLines[Math.floor(Math.random() * introLines.length)];
  return { role: 'assistant', content: intro };
}

app.post('/interact', async (req, res) => {
  const userInput = req.body.text || "";

  const messages = [
    systemMessage,
    getIntroMessage()
  ];

  if (userInput.trim()) {
    messages.push({ role: 'user', content: userInput });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.8
    });

    const response = completion.choices[0].message.content;
    res.json({ reply: response });
  } catch (error) {
    console.error('OpenAI error:', error);
    res.status(500).send('Error interacting with OpenAI: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
