import express from 'express';
import {
  sendMessage,
  getAllChats,
  getChatById,
  deleteChat,
  updateChat,
} from '../controller/chat.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST   /api/chat/send        → Send message & get AI reply
router.post('/send', protect, sendMessage);

// GET    /api/chat/history     → All sessions list (for sidebar)
router.get('/history', protect, getAllChats);

// GET    /api/chat/:id         → Full message thread of a session
router.get('/:id', protect, getChatById);

// DELETE /api/chat/:id         → Delete a session
router.delete('/:id', protect, deleteChat);

// PUT    /api/chat/:id         → Update chat details (title, isPinned, isArchived, projectId)
router.put('/:id', protect, updateChat);

export default router;
