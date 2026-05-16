import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/Chat.js';
import { getIsConnected } from '../database/connection.js';

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Centralized Model Configuration ──────────────────────────────────────────
// Adding a new model in the future is as easy as adding one line here!
const MODEL_CONFIG = {
  'gemini-2.5-flash': { provider: 'gemini', actualId: 'gemini-2.5-flash' },
  'gemini-2.5-pro': { provider: 'gemini', actualId: 'gemini-2.5-pro' },
  'idr-ai-v1': {
    provider: 'gemini',
    actualId: 'gemini-2.5-flash',
    systemInstruction: {
      role: 'system',
      parts: [{ text: "You are IDR AI, an advanced, highly intelligent AI assistant custom-trained and created by IDR Tech. You should be helpful, concise, and proudly identify yourself as IDR AI if asked who you are or who made you." }]
    }
  },
  'gpt-4o': { provider: 'openrouter', actualId: 'openai/gpt-4o' },
  'deepseek-chat': { provider: 'openrouter', actualId: 'deepseek/deepseek-chat' },
};

// ─── POST /api/chat/send ───────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  const { message, chatId, aiModel, projectId, editIndex } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ success: false, error: 'User session expired. Please re-login.' });
  }

  if (!message || !message.trim()) {
    return res.status(400).json({ success: false, error: 'Message is required.' });
  }

  const modelDef = MODEL_CONFIG[aiModel] || MODEL_CONFIG['gemini-2.5-flash'];

  try {
    const dbAvailable = getIsConnected();
    let historyGemini = [];
    let historyOpenAI = [];
    let chatSession = null;

    if (dbAvailable && chatId) {
      chatSession = await Chat.findOne({ _id: chatId, userId });
      if (chatSession) {
        // Handle Edit: Truncate history if editIndex is provided
        if (typeof editIndex === 'number' && editIndex >= 0 && editIndex < chatSession.messages.length) {
          chatSession.messages = chatSession.messages.slice(0, editIndex);
          // The new message will be pushed later in the normal flow
        }

        historyGemini = chatSession.messages.map((m) => ({
          role: m.role === 'ai' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
        historyOpenAI = chatSession.messages.map((m) => ({
          role: m.role === 'ai' ? 'assistant' : 'user',
          content: m.content,
        }));
      }
    }

    let aiText = '';

    // AI Generation (same as before)
    if (modelDef.provider === 'openrouter' || modelDef.provider === 'openai') {
      const apiKey = modelDef.provider === 'openrouter' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
      const apiUrl = modelDef.provider === 'openrouter' ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";

      const apiRes = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "IDR AI Chatbot"
        },
        body: JSON.stringify({
          model: modelDef.actualId,
          messages: [
            ...historyOpenAI,
            { role: "user", content: message.trim() }
          ],
          max_tokens: 1000
        })
      });
      const data = await apiRes.json();
      if (data.choices && data.choices.length > 0) {
        aiText = data.choices[0].message.content;
      } else {
        throw new Error(`${modelDef.provider} API failed: ` + JSON.stringify(data));
      }
    }
    else if (modelDef.provider === 'gemini') {
      const modelOptions = { model: modelDef.actualId };
      if (modelDef.systemInstruction) {
        modelOptions.systemInstruction = modelDef.systemInstruction;
      }
      const model = genAI.getGenerativeModel(modelOptions);
      const chat = model.startChat({ history: historyGemini });
      const result = await chat.sendMessage(message.trim());
      aiText = result.response.text();
    }

    let returnedChatId = chatId || null;

    if (dbAvailable) {
      if (chatSession) {
        chatSession.messages.push({ role: 'user', content: message.trim() });
        chatSession.messages.push({ role: 'ai', content: aiText });
        await chatSession.save();
      } else {
        const newSession = await Chat.create({
          userId,
          projectId: projectId || null,
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
    const { projectId } = req.query;
    const filter = { userId: req.user.userId };
    if (projectId) filter.projectId = projectId;

    const chats = await Chat.find(filter, 'title createdAt projectId').sort({ createdAt: -1 });
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
    const chat = await Chat.findOne({ _id: req.params.id, userId: req.user.userId });
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
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, userId: req.user.userId });
    if (!chat) return res.status(404).json({ success: false, error: 'Chat not found or unauthorized.' });
    res.status(200).json({ success: true, message: 'Chat deleted successfully.' });
  } catch (error) {
    console.error('❌ DB Error in deleteChat:', error.message);
    res.status(500).json({ success: false, error: 'Failed to delete chat.' });
  }
};
