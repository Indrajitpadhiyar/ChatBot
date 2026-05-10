import mongoose from 'mongoose';
import dns from 'dns';

dns.setServers(["8.8.8.8", "8.8.4.4"]);

let isConnected = false;

export const connectDB = async () => {
  if (!process.env.MONGO_URI || process.env.MONGO_URI.trim() === '') {
    console.warn('⚠️  MONGO_URI not set — running without database.');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn('⚠️  MongoDB unavailable — history features disabled.');
    console.warn(`   Reason: ${error.message}`);
    console.warn('   💡 Fix: Whitelist your IP in MongoDB Atlas → Network Access → Add 0.0.0.0/0');
  }
};

export const getIsConnected = () => isConnected;