import 'dotenv/config';

export const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  geminiApiKey: process.env.GEMINI_API_KEY,
  cloudinaryApi: process.env.CLOUDINARY_API,
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
};
