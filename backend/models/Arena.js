const mongoose = require("mongoose");
const { Schema } = mongoose;

const arenaSchema = new Schema(
  {
    name: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    description: String,
    location: {
      city: String,
      address: String,
      coordinates: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: [Number], // [longitude, latitude]
      },
    },
    sports: [{ type: String, enum: ["cricket", "futsal"] }],
    pricePerHour: Number,
    images: [String],
    availability: [
      {
        day: String, // 'monday', 'tuesday'...
        slots: [String], // ['10:00-11:00', '14:00-15:00']
      },
    ],
    approved: { type: Boolean, default: false }, // admin approval
    rating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

arenaSchema.index({ "location.coordinates": "2dsphere" }); // for geo search

module.exports = mongoose.model("Arena", arenaSchema);
