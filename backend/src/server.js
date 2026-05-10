import { config } from './config/index.js';
import { connectDB } from './database/connection.js';
import app from './app.js';

// ─── Connect to MongoDB Atlas ──────────────────────────────────────────────────
connectDB();

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
});
