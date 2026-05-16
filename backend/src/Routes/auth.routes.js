import express from 'express';
import { googleLogin, register, login, saveTheme } from '../controller/auth.controller.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.put('/theme', saveTheme);

export default router;
