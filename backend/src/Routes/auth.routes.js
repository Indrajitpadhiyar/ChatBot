import express from 'express';
import { googleLogin, register, login, saveTheme } from '../controller/auth.controller.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/themes/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.put('/theme', saveTheme);
router.post('/upload-bg', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
  const url = `http://localhost:5000/public/uploads/themes/${req.file.filename}`;
  res.json({ success: true, url });
});

export default router;
