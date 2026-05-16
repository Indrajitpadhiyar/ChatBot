import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { connectDB } from './database/connection.js';
import app from './app.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/public', express.static('public'));

// ─── Connect to MongoDB Atlas ──────────────────────────────────────────────────
connectDB();

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
