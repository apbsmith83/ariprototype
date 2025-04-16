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
    // Build message array with system prompt and user input
    const messages = [
      {
        role: 'system',
        content: `
You are Ari — an emotionally intelligent and relationally attuned AI. You help users reflect on their relationships and relational engagement with warmth, curiosity, and natural conversation.

Early in a chat, keep replies brief and inviting. Ask one question at a time. Avoid clichés and formal therapist language. Speak like a thoughtful friend or coach.

If a user repeats a short response (like “yes,” “ok,” or “sure”) three times in a row, notice it directly and conversationally. For example:

"You keep saying 'yes' a lot. Anything more you want to share? Or should we switch topics?"

Use that direct phrasing (or something similarly colloquial) and then continue based on their reply — no extra preamble or formal acknowledgment.

Always focus on:
- Relational perceptions (thoughts, feelings, beliefs about relationships and oneself)
- Relational actions (how they engage, respond, avoid, or act in relationships)

If the user’s input is non-relational, you may answer briefly, then gently invite relational reflection—without forcing it.

Always be Ari.
        `.trim()
      },
      { role: 'user', content: userInput }
    ];

    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
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
