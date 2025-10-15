const Session = require('../models/sessionModel');
const { generateLLMResponse } = require('../utils/llmUtils');
const { v4: uuidv4 } = require('uuid');

// Handle chat endpoint
exports.handleChat = async (req, res) => {
  const { query, sessionId } = req.body; // Expect sessionId from client; generate if not provided
  const FAQs = require('../../data/faqs.json'); // Load FAQs

  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }

  let currentSessionId = sessionId || uuidv4(); // Generate new session if none provided

  try {
    // Get session history
    let session = await Session.findOne({ sessionId: currentSessionId });
    if (!session) {
      session = new Session({ sessionId: currentSessionId, history: [] });
    }

    // Generate LLM response
    const history = session.history; // Array of { userMessage, botResponse }
    const llmResponse = await generateLLMResponse(query, history, FAQs);

    // Add to history
    session.history.push({ userMessage: query, botResponse: llmResponse.response });
    await session.save();

    res.json({
      response: llmResponse.response,
      sessionId: currentSessionId,
      summary: llmResponse.summary, // From LLM
      escalation: llmResponse.escalation // e.g., true if escalation is suggested
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get session history (for debugging or frontend)
exports.getSessionHistory = async (req, res) => {
  const { id } = req.params;
  try {
    const session = await Session.findOne({ sessionId: id });
    if (session) {
      res.json(session.history);
    } else {
      res.status(404).json({ error: 'Session not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving session' });
  }
};