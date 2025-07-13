const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema(
  {
    arena: { type: Schema.Types.ObjectId, ref: "Arena", required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking" }, // optional, for booking-specific reviews
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    },
    comment: { 
      type: String, 
      required: true,
      maxlength: 1000 
    },
    photos: [String], // array of photo URLs
    sport: { type: String, enum: ["cricket", "futsal"] },
    isVerified: { type: Boolean, default: false }, // if user actually played there
    helpful: [{ type: Schema.Types.ObjectId, ref: "User" }], // users who found this helpful
    reported: { type: Boolean, default: false },
    reportReason: String,
  },
  { timestamps: true }
);

// Ensure one review per user per arena
reviewSchema.index({ arena: 1, user: 1 }, { unique: true });
reviewSchema.index({ arena: 1, rating: 1 });
reviewSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);
