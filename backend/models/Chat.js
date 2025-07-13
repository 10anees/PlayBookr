const mongoose = require("mongoose");
const { Schema } = mongoose;

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text"
    },
    attachments: [{
      type: String, // file URL
      name: String,
      size: Number
    }],
    readBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    isEdited: { type: Boolean, default: false },
    editedAt: Date,
  },
  { timestamps: true }
);

const chatSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["direct", "arena", "city", "sport", "tournament"],
      required: true
    },
    name: String, // for group chats
    description: String, // for group chats
    // For direct messages
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // For group chats
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    admins: [{ type: Schema.Types.ObjectId, ref: "User" }],
    // Context-specific fields
    arena: { type: Schema.Types.ObjectId, ref: "Arena" }, // for arena-specific chats
    city: String, // for city-specific chats
    sport: { type: String, enum: ["cricket", "futsal"] }, // for sport-specific chats
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament" }, // for tournament chats
    // Chat settings
    isActive: { type: Boolean, default: true },
    isPrivate: { type: Boolean, default: false },
    // Messages
    messages: [messageSchema],
    lastMessage: {
      content: String,
      sender: { type: Schema.Types.ObjectId, ref: "User" },
      timestamp: Date
    },
    // Chat metadata
    totalMessages: { type: Number, default: 0 },
    unreadCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for efficient queries
chatSchema.index({ participants: 1 }); // for direct messages
chatSchema.index({ type: 1, arena: 1 }); // for arena chats
chatSchema.index({ type: 1, city: 1 }); // for city chats
chatSchema.index({ type: 1, sport: 1 }); // for sport chats
chatSchema.index({ "lastMessage.timestamp": -1 }); // for sorting by recent activity

module.exports = mongoose.model("Chat", chatSchema);