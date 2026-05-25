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

// Helper function to call specific AI model API based on provider
const generateResponseForModel = async (modelKey, message, historyMessages) => {
  const modelDef = MODEL_CONFIG[modelKey] || MODEL_CONFIG['gemini-2.5-flash'];
  
  if (modelDef.provider === 'openrouter' || modelDef.provider === 'openai') {
    const apiKey = modelDef.provider === 'openrouter' ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY;
    const apiUrl = modelDef.provider === 'openrouter' ? "https://openrouter.ai/api/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";

    const historyOpenAI = historyMessages.map((m) => ({
      role: m.role === 'ai' ? 'assistant' : 'user',
      content: m.content,
    }));

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
      return data.choices[0].message.content;
    } else {
      throw new Error(`${modelDef.provider} API failed: ` + JSON.stringify(data));
    }
  } else if (modelDef.provider === 'gemini') {
    const historyGemini = historyMessages.map((m) => ({
      role: m.role === 'ai' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const modelOptions = { model: modelDef.actualId };
    if (modelDef.systemInstruction) {
      modelOptions.systemInstruction = modelDef.systemInstruction;
    }
    const model = genAI.getGenerativeModel(modelOptions);
    const chat = model.startChat({ history: historyGemini });
    const result = await chat.sendMessage(message.trim());
    return result.response.text();
  }
  throw new Error(`Unsupported provider for model: ${modelKey}`);
};

// ─── POST /api/chat/send ───────────────────────────────────────────────────────
export const sendMessage = async (req, res) => {
  const { message, chatId, aiModel, projectId } = req.body;
  const editIndex = req.body.editIndex !== undefined ? Number(req.body.editIndex) : undefined;
  const userId = req.user?.userId;
  const messageText = (message || '').trim();
  const attachments = (req.files || []).map((file) => ({
    originalName: file.originalname,
    filename: file.filename,
    mimetype: file.mimetype,
    size: file.size,
    url: `http://localhost:5000/public/uploads/chat/${file.filename}`,
  }));

  if (!userId) {
    return res.status(401).json({ success: false, error: 'User session expired. Please re-login.' });
  }

  if (!messageText && attachments.length === 0) {
    return res.status(400).json({ success: false, error: 'Message or file is required.' });
  }

  try {
    const dbAvailable = getIsConnected();
    let historyMessages = [];
    let chatSession = null;

    if (dbAvailable && chatId) {
      chatSession = await Chat.findOne({ _id: chatId, userId });
      if (chatSession) {
        // Handle Edit: Truncate history if editIndex is provided
        if (typeof editIndex === 'number' && editIndex >= 0 && editIndex < chatSession.messages.length) {
          chatSession.messages = chatSession.messages.slice(0, editIndex);
        }
        historyMessages = chatSession.messages;
      }
    }

    const isGroup = aiModel && (aiModel.startsWith('group:') || aiModel.includes(','));
    const modelsToInvoke = isGroup
      ? aiModel.replace('group:', '').split(',').filter(Boolean)
      : [aiModel || 'gemini-2.5-flash'];

    const attachmentContext = attachments.length
      ? `\n\nAttached files:\n${attachments.map((file) => `- ${file.originalName} (${file.mimetype}, ${Math.round(file.size / 1024)} KB): ${file.url}`).join('\n')}`
      : '';
    const promptMessage = `${messageText || 'Please review the attached file(s).'}${attachmentContext}`;

    // Invoke all models in parallel
    const generationPromises = modelsToInvoke.map(async (modelKey) => {
      try {
        const reply = await generateResponseForModel(modelKey, promptMessage, historyMessages);
        return { success: true, model: modelKey, reply };
      } catch (err) {
        console.error(`Error generating for ${modelKey}:`, err);
        return { success: false, model: modelKey, error: err.message };
      }
    });

    const results = await Promise.all(generationPromises);

    // Filter out successful results
    const successfulReplies = results.filter(r => r.success);
    if (successfulReplies.length === 0) {
      const firstError = results[0]?.error || 'Unknown AI Error';
      throw new Error(`All models failed: ${firstError}`);
    }

    let returnedChatId = chatId || null;

    if (dbAvailable) {
      if (chatSession) {
        chatSession.messages.push({ role: 'user', content: messageText || 'Attached file(s)', attachments });
        for (const item of successfulReplies) {
          chatSession.messages.push({ role: 'ai', content: item.reply, model: item.model });
        }
        await chatSession.save();
      } else {
        const newMessages = [{ role: 'user', content: messageText || 'Attached file(s)', attachments }];
        for (const item of successfulReplies) {
          newMessages.push({ role: 'ai', content: item.reply, model: item.model });
        }
        const newSession = await Chat.create({
          userId,
          projectId: projectId || null,
          messages: newMessages,
        });
        returnedChatId = newSession._id;
      }
    }

    res.status(200).json({
      success: true,
      chatId: returnedChatId,
      reply: successfulReplies[0].reply,
      replies: isGroup ? successfulReplies : null,
      model: isGroup ? null : modelsToInvoke[0],
      attachments,
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

    const chats = await Chat.find(filter, 'title createdAt projectId isPinned isArchived').sort({ createdAt: -1 });
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

// ─── PUT /api/chat/:id ─────────────────────────────────────────────────────────
export const updateChat = async (req, res) => {
  if (!getIsConnected()) {
    return res.status(503).json({ success: false, error: 'Database unavailable.' });
  }
  try {
    const { id } = req.params;
    const { title, projectId, isPinned, isArchived } = req.body;
    const userId = req.user.userId;

    const chat = await Chat.findOne({ _id: id, userId });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat not found.' });
    }

    if (title !== undefined) chat.title = title;
    if (projectId !== undefined) chat.projectId = projectId || null;
    if (isPinned !== undefined) chat.isPinned = isPinned;
    if (isArchived !== undefined) chat.isArchived = isArchived;

    await chat.save();
    res.status(200).json({ success: true, chat, message: 'Chat updated successfully.' });
  } catch (error) {
    console.error('❌ DB Error in updateChat:', error.message);
    res.status(500).json({ success: false, error: 'Failed to update chat.' });
  }
};
