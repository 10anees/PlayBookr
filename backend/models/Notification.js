const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: [
        "match_request",
        "match_accepted",
        "match_rejected",
        "booking_reminder",
        "booking_confirmed",
        "booking_cancelled",
        "tournament_invite",
        "tournament_application",
        "tournament_accepted",
        "tournament_rejected",
        "new_message",
        "review_received",
        "team_invite",
        "team_joined",
        "admin_approval",
        "admin_rejection"
      ],
      required: true
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    // Related entities
    sender: { type: Schema.Types.ObjectId, ref: "User" }, // who triggered the notification
    arena: { type: Schema.Types.ObjectId, ref: "Arena" },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" },
    match: { type: Schema.Types.ObjectId, ref: "Match" },
    tournament: { type: Schema.Types.ObjectId, ref: "Tournament" },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    chat: { type: Schema.Types.ObjectId, ref: "Chat" },
    review: { type: Schema.Types.ObjectId, ref: "Review" },
    // Notification data
    data: Schema.Types.Mixed, // additional data specific to notification type
    isRead: { type: Boolean, default: false },
    readAt: Date,
    // Action buttons (for frontend)
    actions: [{
      label: String,
      action: String, // 'accept', 'reject', 'view', etc.
      url: String // optional deep link
    }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium"
    },
    expiresAt: Date, // for time-sensitive notifications
  },
  { timestamps: true }
);

// Indexes for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for expired notifications

module.exports = mongoose.model("Notification", notificationSchema);
