import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../../models/Chat.js';
import { getIsConnected } from '../../database/connection.js';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── POST /api/chat/send ───────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  const { message, chatId, aiModel } = req.body;
  
  // Handle custom IDR AI mapping
  let selectedModel = aiModel || 'gemini-2.5-flash';
  let systemInstruction = undefined;
  
  if (selectedModel === 'idr-ai-v1') {
    selectedModel = 'gemini-2.5-flash';
    systemInstruction = {
      role: 'system',
      parts: [{ text: "You are IDR AI, an advanced, highly intelligent AI assistant custom-trained and created by Indrajit. You should be helpful, concise, and proudly identify yourself as IDR AI if asked who you are or who made you." }]
    };
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  try {
    const dbAvailable = getIsConnected();
    let history = [];
    let chatSession = null;

    // Build Gemini history from DB if continuing a session
    if (dbAvailable && chatId) {
      chatSession = await Chat.findById(chatId);
      if (chatSession) {
        history = chatSession.messages.map((m) => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
      }
    }

    // ── Call Gemini API with selected model and optional system instruction ──
    const modelOptions = { model: selectedModel };
    if (systemInstruction) {
      modelOptions.systemInstruction = systemInstruction;
    }
    const model = genAI.getGenerativeModel(modelOptions);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(message.trim());
    const aiText = result.response.text();

    // ── Persist to MongoDB (only when DB is available) ───────────────────────
    let returnedChatId = chatId || null;

    if (dbAvailable) {
      if (chatSession) {
        chatSession.messages.push({ role: 'user', content: message.trim() });
        chatSession.messages.push({ role: 'ai', content: aiText });
        await chatSession.save();
      } else {
        const newSession = await Chat.create({
          messages: [
            { role: 'user', content: message.trim() },
            { role: 'ai', content: aiText },
          ],
        });
        returnedChatId = newSession._id;
      }
    }

    res.status(200).json({
      success: true,
      chatId: returnedChatId,
      reply: aiText,
      dbAvailable,
    });
  } catch (error) {
    console.error('❌ Error in sendMessage:', error.message);
    if (error.status === 429) {
      return res.status(429).json({ success: false, error: 'Rate limit reached. Please wait a moment and try again.' });
    }
    res.status(500).json({ success: false, error: `AI Error: ${error.message}` });
  }
};

// ─── GET /api/chat/history ─────────────────────────────────────────────────────
export const getAllChats = async (req, res) => {
  if (!getIsConnected()) {
    return res.status(200).json({ success: true, chats: [], dbAvailable: false });
  }
  try {
    const chats = await Chat.find({}, 'title createdAt').sort({ createdAt: -1 });
    res.status(200).json({ success: true, chats, dbAvailable: true });
  } catch (error) {
    console.error('❌ DB Error in getAllChats:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch chat history.' });
  }
};

// ─── GET /api/chat/:id ─────────────────────────────────────────────────────────
export const getChatById = async (req, res) => {
  if (!getIsConnected()) {
    return res.status(503).json({ success: false, error: 'Database unavailable.' });
  }
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) return res.status(404).json({ success: false, error: 'Chat not found.' });
    res.status(200).json({ success: true, chat });
  } catch (error) {
    console.error('❌ DB Error in getChatById:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch chat.' });
  }
};

// ─── DELETE /api/chat/:id ──────────────────────────────────────────────────────
export const deleteChat = async (req, res) => {
  if (!getIsConnected()) {
    return res.status(503).json({ success: false, error: 'Database unavailable.' });
  }
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Chat deleted successfully.' });
  } catch (error) {
    console.error('❌ DB Error in deleteChat:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete chat.' });
  }
};
