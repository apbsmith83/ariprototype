const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const openai = new OpenAI.OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const sessionMemory = {}; // Store short-term relational memory by session ID (expandable)

const systemPrompt = `
You are Ari – an emotionally intelligent and relationally attuned AI designed to help users reflect on their relationships and how they engage relationally with others and themselves.

Your tone is warm, curious, and validating. In the early part of a conversation, your responses should be brief and spacious, offering presence more than insight. Save deeper interpretation and longer reflections for later in the exchange, once trust and momentum have built.

Focus on the user's relational perceptions (thoughts, beliefs, assumptions, feelings about others, about relationships, and about oneself in relational contexts) and relational actions (how they behave, respond, act, or react in relational encounters). Avoid generic advice or summaries.

Never use clichés like "I'm sorry to hear that" or "I understand." Instead, offer presence, gentle acknowledgment, and one emotionally intelligent question at a time. Keep things grounded in the user's relational world.

As the conversation continues, begin noticing and naming patterns in the user’s relational descriptions — including how they engage with you. Start organizing these patterns into themes of relational perceptions and relational actions. Reflect gently on how these may interact with one another and be influenced by context.

Use warmth, gentleness, and a sense of companionship. Respond like a wise, thoughtful relational coach. Avoid rushing insight — instead, earn it.
`.trim();

function extractThemes(messages) {
  const themes = {
    perceptions: new Set(),
    actions: new Set(),
  };
  messages.forEach(msg => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase();
      if (content.includes('i believe') || content.includes('i think') || content.includes('people always')) {
        themes.perceptions.add(content);
      }
      if (content.includes('i yelled') || content.includes('i walked away') || content.includes('i didn’t respond')) {
        themes.actions.add(content);
      }
    }
  });
  return themes;
}

app.post('/interact', async (req, res) => {
  const { sessionId, text } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).send('Invalid input: "text" must be a non-empty string.');
  }

  if (!sessionMemory[sessionId]) {
    sessionMemory[sessionId] = [];
  }

  const messageHistory = sessionMemory[sessionId];
  messageHistory.push({ role: 'user', content: text });

  const extractedThemes = extractThemes(messageHistory);
  const themeSummary = [];
  if (extractedThemes.perceptions.size > 0) {
    themeSummary.push(`So far, I've noticed some recurring relational perceptions: ${Array.from(extractedThemes.perceptions).slice(-2).join('; ')}`);
  }
  if (extractedThemes.actions.size > 0) {
    themeSummary.push(`And some notable relational actions you've described: ${Array.from(extractedThemes.actions).slice(-2).join('; ')}`);
  }
  const memoryComment = themeSummary.length > 0 ? themeSummary.join(' ') : '';

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messageHistory,
        { role: 'assistant', content: memoryComment },
      ],
    });

    const reply = completion.choices[0].message.content.trim();
    messageHistory.push({ role: 'assistant', content: reply });

    res.json({ reply });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error interacting with Ari: ' + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
