import express from 'express';
import {
  sendMessage,
  getAllChats,
  getChatById,
  deleteChat,
} from '../controller/chat.controller.js';

const router = express.Router();

// POST   /api/chat/send        → Send message & get AI reply
router.post('/send', sendMessage);

// GET    /api/chat/history     → All sessions list (for sidebar)
router.get('/history', getAllChats);

// GET    /api/chat/:id         → Full message thread of a session
router.get('/:id', getChatById);

// DELETE /api/chat/:id         → Delete a session
router.delete('/:id', deleteChat);

export default router;
