import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: { type: String, sparse: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    name: { type: String, required: true },
    picture: { type: String },
    theme: { type: Object, default: {} },
    plan: { type: String, default: 'free', enum: ['free', 'pro', 'enterprise'] },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
