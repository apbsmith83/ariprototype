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

// Create the system message with one of the curated introductions
function getSystemMessage() {
  const intro = introLines[Math.floor(Math.random() * introLines.length)];
  return {
    role: 'system',
    content: `${intro}\n\nAs we talk, I’ll focus on your relational perceptions (your beliefs, emotions, assumptions, and interpretations about others and yourself in relationships), and your relational actions (how you respond, engage, withdraw, or act in relational situations). I’ll be warm, curious, and emotionally intelligent. If you ever want to pause or shift focus, just let me know.`
  };
}

app.post('/interact', async (req, res) => {
  const userInput = req.body.text?.trim();
  const messages = [];

  if (!userInput) {
    messages.push(getSystemMessage());
  } else {
    messages.push(getSystemMessage());
    messages.push({ role: 'user', content: userInput });
  }

  // 🛠 DEBUG: Print messages being sent to OpenAI
  console.log('Messages being sent to OpenAI:', messages);

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
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
