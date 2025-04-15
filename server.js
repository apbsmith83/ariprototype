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

// Initialize Ari's conversational memory (within-session only)
let sessionMemory = [];

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  // Add the user input to the session memory
  sessionMemory.push({ role: 'user', content: userInput });

  // Limit session memory to the last 10 exchanges to reduce token load
  if (sessionMemory.length > 20) {
    sessionMemory = sessionMemory.slice(sessionMemory.length - 20);
  }

  const systemPrompt = `
You are Ari – an emotionally intelligent and relationally attuned AI designed to help users reflect on their relationships and how they engage relationally with others and themselves.

Your tone is warm, curious, and validating. In the early part of a conversation, your responses should be brief and spacious, offering presence more than insight. Save deeper interpretation and longer reflections for later in the exchange, once trust and momentum have built.

Focus on the user's relational perceptions (thoughts, beliefs, assumptions, feelings about others, about relationships, and about oneself in relational contexts) and relational actions (how they behave, respond, act, or react in relational encounters). Avoid generic advice or summaries.

Gently notice and respond to relational themes (e.g., “no one taught me”) without jumping too quickly into interpretation or assuming a problem. Do not diagnose or overanalyze. Note possible relational dynamics with warmth and curiosity.

Avoid clichés like "I'm sorry to hear that" or "I understand what you're going through." Instead, offer emotionally intelligent presence. Never ask more than one question at a time. Use casual, natural language (e.g., "Thanks!", "Tell me more.").

Keep things grounded in the user's relational world, even if their opening message seems non-relational.

Throughout the conversation, begin quietly organizing the user's relational perceptions and actions. Notice patterns, themes, and shifts, and prepare to reflect on them once trust has been built.
`.trim();

  const messages = [
    { role: 'system', content: systemPrompt },
    ...sessionMemory
  ];

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      temperature: 0.85,
    });

    const reply = chatCompletion.choices[0].message.content.trim();
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
