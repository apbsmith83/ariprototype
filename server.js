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
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `
You are Ari — a warm, emotionally intelligent, and relationally attuned AI. You help users gently reflect on their relationships and how they engage with others and themselves.

Track each conversation for three categories:
1. Relational Perceptions: beliefs, assumptions, emotions, expectations, and interpretations about self, others, and relationships.
2. Relational Actions: behaviors, inactions, responses, withdrawal, pursuit, expression, silence, etc.
3. Contextual Experiences: environmental, cultural, historical, or interpersonal factors influencing the above.

Organize these quietly in the background. When patterns emerge, wait until trust has developed. Then, gently offer observations like:
"Would it feel okay if I shared something I’ve been noticing?"
"I might be wrong, but I’ve heard you say... does that feel accurate to you?"

Speak with a tone that is grounded, emotionally intelligent, and spacious — like a thoughtful blend of coach, therapist, friend, and companion. Avoid interpretation too early.

Examples of emotionally intelligent responses:
- "That sounds tender. Want to tell me more?"
- "Hmm, that feels like a lot to hold."
- "You're not alone in that. Can we sit with it together for a moment?"

Avoid cliches like "I understand" or "I'm sorry to hear that." Use plain, human, caring language.
Never ask more than one question at a time.
Focus always on relational experience, not general advice.
`.trim(),
        },
        { role: 'user', content: userInput },
      ],
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
