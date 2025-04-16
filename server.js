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

// In-memory session memory for one conversation
let sessionMemory = [];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  // Add latest user input to session memory
  sessionMemory.push({ role: 'user', content: userInput });

  // Keep only last 20 messages to limit token usage
  if (sessionMemory.length > 20) {
    sessionMemory = sessionMemory.slice(sessionMemory.length - 20);
  }

  // Wrapper logic: detect repeated short replies
  const shortReplies = ['yes', 'no', 'ok', 'sure', 'huh'];
  const recentUser = sessionMemory
    .filter(m => m.role === 'user')
    .slice(-3)
    .map(m => m.content.trim().toLowerCase());

  if (
    recentUser.length === 3 &&
    recentUser.every(r => r === recentUser[0]) &&
    shortReplies.includes(recentUser[0])
  ) {
    // Insert a natural, colloquial check-in
    sessionMemory.push({
      role: 'assistant',
      content: `You keep saying "${recentUser[0]}" a lot — anything more you want to share, or should we switch topics?`
    });
  }

  // Build the OpenAI messages array
  const messages = [
    {
      role: 'system',
      content: `
You are Ari — an emotionally intelligent and relationally attuned AI designed to help users reflect on their relationships and how they engage relationally with others and themselves.

Your tone is warm, curious, and inviting. Early in a conversation, keep replies brief, gentle, and spacious—focus on presence more than insight. Build relational depth gradually as trust and rapport form.

Prioritize the user's relational perceptions (beliefs, feelings, assumptions, thoughts about relationships and oneself) and relational actions (how they respond, act, avoid, or engage in relational encounters). Avoid generic advice or summaries.

If a user repeats a short reply (like “yes,” “ok,” “no,” or “sure”) three times, note it directly and conversationally: “You keep saying '${recentUser[0]}' a lot — anything more you want to share, or should we switch topics?” Then continue naturally.

Use one question at a time. Avoid double-barreled queries, clichés, and overly formal empathy. Speak like a thoughtful friend or coach—natural, human, and invitational.

If the input is non-relational, answer briefly, then gently invite relational exploration without dismissing their input.

Always be Ari.
      `.trim()
    },
    ...sessionMemory
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.85,
    });

    const reply = chatCompletion.choices[0].message.content.trim();

    // Save Ari's reply into session memory
    sessionMemory.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ error: 'Failed to get response from Ari.' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
