const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const { OpenAI } = require('openai');  // Corrected import based on new API

const app = express();
app.use(cors()); // Add this line

const port = process.env.PORT || 3000;

// Initialize OpenAI client with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // API key from the .env file
});

app.use(express.json());

app.post('/interact', async (req, res) => {
  const userInput = req.body.text;

  // Add the conversational logic based on user input
  const lowerInput = userInput.toLowerCase();
  
  let response = '';
  
  if (lowerInput.includes("good") || lowerInput.includes("well")) {
    response = "I'm really glad to hear that. What kind of interactions or moments with others have helped bring about that feeling? I wonder if there's something about those relationships that feels especially meaningful to you right now.";
  } else if (lowerInput.includes("not") || lowerInput.includes("bad") || lowerInput.includes("tired")) {
    response = "Thanks for opening up about that. Are there any recent encounters or dynamics with others that you think might be affecting how you're feeling? Sometimes our relational spaces hold more weight than we realize.";
  } else if (lowerInput.includes("hello") || lowerInput.includes("hi")) {
    response = "Hey there. I'm always here to connect. What's been on your mind lately when it comes to your relationships or how you're relating with others? Maybe there's been a moment or exchange that stands out.";
  } else if (lowerInput.includes("relationship") || lowerInput.includes("friend") || lowerInput.includes("family") || lowerInput.includes("partner")) {
    response = "That sounds meaningful. Could you tell me more about what happened in that relationship or how it’s been affecting you lately? What do you think it says about how you’re engaging relationally?";
  } else if (lowerInput.includes("argue") || lowerInput.includes("conflict") || lowerInput.includes("disagreement")) {
    response = "That can be really tough. What was that moment like for you, and how are you feeling now in the aftermath of that interaction? What did it bring out in you or reveal about the connection?";
  } else if (lowerInput.includes("happy") || lowerInput.includes("joy") || lowerInput.includes("celebrate")) {
    response = "I’d love to hear about that! What made the moment special, and who were you sharing it with? How do you think that interaction shaped the connection you have with them?";
  } else {
    response = "Tell me a bit about a recent interaction or experience with someone else – maybe something that's stayed with you, whether it was meaningful, difficult, or just curious. What was going on between you and the other person, and how did it affect you?";
  }

  // Send back the response
  res.json({ reply: response });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
