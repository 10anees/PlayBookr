// models/ChatMessage.js
const chatMessageSchema = new Schema({
  arena: { type: Schema.Types.ObjectId, ref: 'Arena', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['text', 'image'], default: 'text' },
}, { timestamps: true });

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
//Arena Group chat only for now