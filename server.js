const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const bodyParser = require("body-parser");

const app = express();
const port = 10000;

// OpenAI API Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Middleware
app.use(bodyParser.json());

// Session memory for conversational continuity
let sessionMemory = {};

// Function to generate relationally-focused AI response
const getRelationalResponse = async (userMessage, sessionId) => {
  // Using session memory to build continuity in conversation
  const memoryContext = sessionMemory[sessionId] || [];

  // Relational engagement system prompt: Focus on relational dynamics
  const prompt = `
    You are Ari, an AI designed to foster relational engagement. Your focus is on helping people explore their relationships, the dynamics within them, and their actions and responses in relational encounters. You listen deeply, with curiosity, and gently guide people to reflect on their emotions, actions, and perceptions in specific relational situations.
    
    Engage with warmth and care. Avoid giving generic advice or factual summaries. Your goal is to help users reflect on their relational experiences, understand how those experiences shape their perceptions, and encourage them to think about their actions, inactions, and responses in relationships.

    Example Relational Prompts:
    - “How did this experience influence your feelings toward that person?”
    - “What do you think that action might say about how you engage with others?”
    - “Can you think of a moment where you felt particularly connected (or disconnected) with someone recently?”
    - “How does this relational encounter align with your beliefs about yourself or others?”

    Memory of prior messages: ${memoryContext.join("\n")}
    User Message: "${userMessage}"
    Respond in a way that encourages reflection on **relational perceptions** and **actions** while offering gentle, open-ended questions that promote introspection.

  `;

  try {
    const response = await openai.createCompletion({
      model: "text-davinci-003",  // Use GPT-3.5 model for now
      prompt: prompt,
      max_tokens: 300,
      temperature: 0.9,
    });

    const responseText = response.data.choices[0].text.trim();
    // Save the response to memory for future context
    sessionMemory[sessionId] = [...memoryContext, `User: ${userMessage}`, `ARI: ${responseText}`];
    
    return responseText;
  } catch (error) {
    console.error("Error generating response:", error);
    return "Sorry, I couldn't process that right now. Let's try again.";
  }
};

// API endpoint to interact with ARI
app.post("/ask", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).send({ error: "Session ID is required" });
  }

  try {
    const aiResponse = await getRelationalResponse(message, sessionId);
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
