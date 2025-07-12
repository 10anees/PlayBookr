const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // recipient
  type: {
    type: String,
    enum: ['booking', 'match_request', 'tournament_invite', 'chat'],
    required: true
  },
  title: String,
  message: String,
  data: Schema.Types.Mixed, // optional dynamic data
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
