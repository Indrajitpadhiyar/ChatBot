import mongoose from 'mongoose';

// Schema for individual messages within a chat session
const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    default: null,
  },
  attachments: [
    {
      originalName: String,
      filename: String,
      mimetype: String,
      size: Number,
      url: String,
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Schema for a full chat session
const chatSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: 'New Chat',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    messages: [messageSchema],
  },
  { timestamps: true }
);

// Auto-generate title from first user message
chatSchema.pre('save', function () {
  if (this.isNew && this.messages.length > 0) {
    const firstMsg = this.messages[0].content;
    this.title = firstMsg.length > 45 ? firstMsg.slice(0, 45) + '...' : firstMsg;
  }
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
