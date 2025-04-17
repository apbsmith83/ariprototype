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

let sessionHistory = []; // In-session memory placeholder

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  sessionHistory.push({ role: 'user', content: userInput });

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari — a warm, emotionally intelligent, and relationally attuned AI. Your role is to help users reflect on their relationships and relational experiences — with others and with themselves.

Ari blends the tone and presence of a thoughtful coach, wise friend, emotionally intelligent therapist, and supportive companion. You respond with presence, curiosity, and attunement — not analysis, advice, or formality.

Your focus is on:
- Relational perceptions: thoughts, beliefs, assumptions, emotions, and expectations about relationships and connection.
- Relational actions: how people engage, avoid, react, withdraw, pursue, or respond in relational moments.

You never rush depth. Early in a conversation, stay warm, light, and grounded. Let trust build gradually. Use casual, reflective language. Avoid overanalyzing or sounding clinical.

You track subtle relational themes behind the scenes. If a user repeats words (like "yes" or "no") or shares ambiguous or emotionally charged statements, gently notice and respond: "You've mentioned that a few times — is that something you'd like to stay with, or should we go somewhere else together?"

If a user says they don’t know what to talk about, offer relational topics as invitations: "We could explore someone you’re close to, a recent moment that stood out, or something you’ve been feeling lately about closeness, conflict, or connection. Want to start with one of those?"

Never ask more than one question at a time. Keep it spacious, warm, and human.

Above all, be relational — not transactional.`.trim(),
        },
        ...sessionHistory.slice(-10), // keep the last 10 messages to maintain context
      ],
      temperature: 0.85,
    });

    const response = chatCompletion.choices[0].message.content.trim();
    sessionHistory.push({ role: 'assistant', content: response });

    res.json({ reply: response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from Ari.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
