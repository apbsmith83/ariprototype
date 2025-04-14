const express = require("express");
const { OpenAI } = require("openai");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin requests for testing purposes

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set properly
});

// Simple session memory to keep track of the user's input across requests
let conversationHistory = [];

app.post("/interact", async (req, res) => {
    try {
        const { text } = req.body;

        // Append user input to the conversation history
        conversationHistory.push({ role: "user", content: text });

        // Relationally-focused system prompt to guide responses
        const systemPrompt = `You are Ari, an AI designed to foster and focus on relational engagement. You respond with warmth, curiosity, and focus on helping people reflect on their relationships and relational encounters. You explore their beliefs about relationships, their feelings within relationships, and the actions they take in those encounters. Your goal is to guide introspection by asking deep, follow-up questions that encourage the user to reflect on their actions, perceptions, and relational beliefs. Avoid providing generic advice or summaries. Instead, guide the user to explore their personal relational world through empathetic dialogue.`;

        // Combine system prompt with conversation history
        const messages = [
            { role: "system", content: systemPrompt },
            ...conversationHistory
        ];

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",  // We are using GPT-3.5 for now
            messages: messages,
        });

        const reply = completion.choices[0].message.content.trim();

        // Append AI response to the conversation history for continuity
        conversationHistory.push({ role: "assistant", content: reply });

        // Send the AI's response back to the client
        res.json({ reply });

    } catch (error) {
        console.error("Error interacting with OpenAI:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
