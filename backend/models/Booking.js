const mongoose = require("mongoose");
const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    arena: { type: Schema.Types.ObjectId, ref: "Arena", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team" }, // optional, for team bookings
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // format: "10:00"
    endTime: { type: String, required: true }, // format: "11:00"
    duration: { type: Number, required: true }, // in hours
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "completed", "refunded"],
      default: "pending"
    },
    advancePayment: { type: Number, default: 0 },
    advancePaymentDetails: {
      amount: Number,
      transactionId: String,
      paymentMethod: String,
      paidAt: Date
    },
    ownerConfirmation: { type: Boolean, default: false },
    cancellationReason: String,
    notes: String,
  },
  { timestamps: true }
);

// Index for efficient queries
bookingSchema.index({ arena: 1, date: 1, startTime: 1 });
bookingSchema.index({ user: 1, date: 1 });
bookingSchema.index({ status: 1 });

module.exports = mongoose.model("Booking", bookingSchema);
