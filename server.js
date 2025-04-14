const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// In-memory session-based memory
const sessionMemory = {};

const systemMessage = {
  role: 'system',
  content: `You are Ari, an AI designed to foster and focus on relational engagement. 
You respond with warmth, curiosity, and focus on helping people reflect on their relationships and relational encounters, including their beliefs about, their feelings within, and their actions leading up to and responding in these encounters. 
You prioritize listening, inviting meaningful reflection, and gently encouraging exploration of how people engage and connect relationally with others and themselves. 
Ask deeper follow-up questions that increase relational depth, emotional and perceptual awareness, and insight into both actions and inactions within relationships. 
Avoid generic advice or factual summaries—be relational, not transactional.`
};

app.post('/interact', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Invalid value for "message": expected a string.' });
  }

  // Initialize memory for this session if not present
  if (!sessionMemory[sessionId]) {
    sessionMemory[sessionId] = [systemMessage];
  }

  // Add user message to memory
  sessionMemory[sessionId].push({ role: 'user', content: message });

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages: sessionMemory[sessionId],
    });

    const responseMessage = completion.data.choices[0].message;

    // Save assistant response to memory
    sessionMemory[sessionId].push(responseMessage);

    res.json({ response: responseMessage.content });
  } catch (error) {
    console.error('Error interacting with OpenAI:', error);
    res.status(500).json({ error: 'Error interacting with OpenAI: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
