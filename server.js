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

// In-memory session memory and summary
let sessionMemory = [];
let memorySummary = '';
const SUMMARY_INTERVAL = 6; // number of messages before summarizing

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  // Add user input
  sessionMemory.push({ role: 'user', content: userInput });
  if (sessionMemory.length > 50) {
    sessionMemory = sessionMemory.slice(-50);
  }

  // Wrapper: uncertainty triggers
  const triggers = [
    "i don't know what to talk about",
    "im not sure",
    "i don't have anything",
    "im blank",
    "i have nothing to say"
  ];
  const norm = userInput.trim().toLowerCase();
  if (triggers.some(t => norm.includes(t))) {
    sessionMemory.push({ role: 'assistant', content: `No worries. Maybe you’d like to pick one: a friendship that’s felt meaningful or tricky, someone you love, a time you felt really seen or misunderstood, or a pattern you notice in how you connect. Does any of that resonate?` });
  }

  // Wrapper: repeated short replies
  const shortReplies = ['yes','no','ok','sure','huh'];
  const recent = sessionMemory.filter(m=>m.role==='user').slice(-3).map(m=>m.content.trim().toLowerCase());
  if (recent.length===3 && recent.every(r=>r===recent[0] && shortReplies.includes(r))) {
    sessionMemory.push({ role: 'assistant', content: `You’ve said “${recent[0]}” a few times—anything more on your mind, or shall we switch gears?` });
  }

  // In-session summary
  if (!memorySummary && sessionMemory.length >= SUMMARY_INTERVAL) {
    try {
      const sumMsgs = [ { role:'system', content: 'Summarize this conversation in 2-3 sentences, focusing on relational perceptions and actions:' }, ...sessionMemory ];
      const sum = await openai.chat.completions.create({ model:'gpt-4', messages: sumMsgs, temperature:0.5, max_tokens:150 });
      memorySummary = sum.choices[0].message.content.trim();
    } catch(e) {
      console.error('Summary error',e);
    }
  }

  // Build system prompt
  let systemContent = `You are Ari — a warm, relationally attuned AI companion focused on helping users reflect on their relationships.`;
  if (memorySummary) {
    systemContent += `\n\nPreviously we discussed: ${memorySummary}`;
  }
  systemContent += `

- In the first few exchanges, keep questions simple and single-focused. Avoid complex, double-barreled or highly abstract questions until the user indicates comfort sitting with deeper reflection.
- Keep responses concise, inviting, and grounded. Speak like a thoughtful friend or coach.
- Focus on the user's relational perceptions (feelings, beliefs, thoughts) and actions (how they connect, respond, avoid).
- If input seems non-relational, answer briefly, then gently invite relational reflection.

Always be Ari.`;

  const messages = [ { role:'system', content: systemContent }, ...sessionMemory ];

  try {
    const chat = await openai.chat.completions.create({ model:'gpt-4', messages, temperature:0.85 });
    const reply = chat.choices[0].message.content.trim();
    sessionMemory.push({ role:'assistant', content: reply });
    res.json({ reply });
  } catch(err) {
    console.error('OpenAI error',err);
    res.status(500).json({ error:'Ari hit a snag.' });
  }
});

app.listen(port,()=>console.log(`Server running on port ${port}`));
