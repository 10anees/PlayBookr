const bookingSchema = new Schema(
  {
    arena: { type: Schema.Types.ObjectId, ref: "Arena", required: true },
    player: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sport: { type: String, enum: ["cricket", "futsal"], required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true }, // e.g., "18:00-19:00"
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "rejected"],
      default: "pending",
    },
    requiresAdvance: { type: Boolean, default: false },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
