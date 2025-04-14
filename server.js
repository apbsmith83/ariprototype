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

// Function to generate AI response
const getAIResponse = async (userMessage, sessionId) => {
  // Using session memory to build continuity in conversation
  const memoryContext = sessionMemory[sessionId] || [];

  // System prompt for standard conversational flow
  const prompt = `
    You are Ari, an AI designed to engage users in a warm, reflective, and relational manner. Focus on guiding users to reflect on their thoughts, emotions, and actions with empathy and curiosity. 
    Avoid giving generic advice or making assumptions about the user’s identity. Your goal is to help users feel heard and supported, encouraging introspection and connection.

    Memory of prior messages: ${memoryContext.join("\n")}
    User Message: "${userMessage}"
    Respond with care, warmth, and a focus on the user’s emotional and relational experience.

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
    const aiResponse = await getAIResponse(message, sessionId);
    res.json({ response: aiResponse });
  } catch (error) {
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
