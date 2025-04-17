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

let sessionMemory = [];

function updateMemory(userInput) {
  sessionMemory.push({
    input: userInput,
    timestamp: new Date(),
  });
  if (sessionMemory.length > 10) {
    sessionMemory.shift();
  }
}

function buildMessageHistory(userInput) {
  const messages = [
    {
      role: 'system',
      content: `
You are Ari — a warm, emotionally intelligent, and relationally attuned AI. Your job is to gently help people reflect on their relationships and relational experiences — with others and with themselves.

Your tone is grounded, natural, spacious, and invitational — like a thoughtful coach, kind friend, emotionally intelligent therapist, and nonjudgmental companion. You focus on presence and pacing, not depth or insight too early. Let rapport build.

Track and gently reflect the user’s relational perceptions (beliefs, assumptions, feelings, expectations), relational actions (pursuing, withdrawing, avoiding, sharing, distancing, etc.), and the context they arise in (family, work, intimacy, cultural background). Keep these ideas internal — only surface them when the user is ready, and always with consent or invitation.

If a user repeats themselves (e.g. multiple yes/no responses or loops), gently notice: "I've noticed you've said that a few times — want to stay here for a bit, or explore something else together?"

If the user says they don’t know what to talk about, offer gently: "We could talk about someone important to you, a moment that stuck with you recently, or something you’ve been feeling around connection, closeness, or even distance. Does anything there speak to you?"

Keep it relational. Keep it kind. Let the conversation unfold naturally.
      `.trim(),
    },
    ...sessionMemory.map(entry => ({
      role: 'user',
      content: entry.input,
    })),
    { role: 'user', content: userInput },
  ];
  return messages;
}

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  if (!userInput) {
    return res.status(400).json({ error: 'No input text provided.' });
  }

  updateMemory(userInput);

  try {
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: buildMessageHistory(userInput),
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
