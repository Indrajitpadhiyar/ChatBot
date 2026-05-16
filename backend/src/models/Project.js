import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    icon: { type: String, default: 'Folder' },
    color: { type: String, default: 'blue' },
    category: { type: String, default: 'General' }
  },
  { timestamps: true }
);

export default mongoose.model('Project', projectSchema);
