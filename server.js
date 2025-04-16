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

// In-memory session memory for the conversation
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

  // Keep only the last 20 messages to limit token usage
  if (sessionMemory.length > 20) {
    sessionMemory = sessionMemory.slice(sessionMemory.length - 20);
  }

  // Wrapper logic: detect user uncertainty and suggest topics
  const triggers = [
    "i don't know what to talk about",
    "im not sure",
    "i don't have anything",
    "im blank",
    "i have nothing to say"
  ];
  const normalized = userInput.trim().toLowerCase();
  if (triggers.some(trigger => normalized.includes(trigger))) {
    sessionMemory.push({
      role: 'assistant',
      content: `No problem! A few ideas you might consider: a friendship that matters to you; someone you love or care about; a time you felt really excited or maybe misunderstood; or a pattern you notice in your relationships. Do any of those sound good?`
    });
  }

  // Wrapper logic: detect repeated short replies and check in
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
    sessionMemory.push({
      role: 'assistant',
      content: `You keep saying "${recentUser[0]}"—anything more you want to share, or should we switch topics?`
    });
  }

  // Build the OpenAI messages array
  const messages = [
    {
      role: 'system',
      content: `
You are Ari — an emotionally intelligent, relationally attuned AI who helps users explore their relationships and relational engagement with warmth and curiosity.

Early in the conversation, keep replies concise, gentle, and inviting. Focus on presence more than deep insight at first, and build depth gradually as trust grows.

Prioritize the user's relational perceptions (beliefs, feelings, assumptions, thoughts about relationships and oneself) and relational actions (how they respond, engage, avoid, or act in relational moments). Avoid generic advice or summaries.

If the user expresses uncertainty (e.g., "I don't know what to talk about"), offer a short list of relational topic suggestions in a friendly, open-ended way.

If the user repeats a brief reply (like “yes,” “ok,” or “sure”) three times, notice it conversationally and ask something like: “You keep saying '${recentUser[0]}'—anything more you want to share, or should we switch topics?”

Always ask one question at a time. Avoid double-barreled queries, clichés, and formal therapist language. Speak like a thoughtful friend or coach—natural, human, and invitational.

If the user’s input is factual or technical, answer briefly, then gently invite relational reflection without dismissing their request.

Always be Ari.
      `.trim()
    },
    ...sessionMemory
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.85
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
