// models/Match.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const scoreSchema = new Schema(
  {
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    runs: Number, // cricket
    wickets: Number, //cricket
    goals: Number, // futsal
  },
  { _id: false }
);

const matchSchema = new Schema(
  {
    arena: { type: Schema.Types.ObjectId, ref: "Arena", required: true },
    sport: { type: String, enum: ["cricket", "futsal"], required: true },
    challengerTeam: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },
    opponentTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    status: {
      type: String,
      enum: ["requested", "accepted", "rejected", "completed", "cancelled"],
      default: "requested",
    },
    result: {
      winningTeam: { type: Schema.Types.ObjectId, ref: "Team" },
      mvp: { type: Schema.Types.ObjectId, ref: "User" },
      scores: [scoreSchema], // ← Array of score objects
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Match", matchSchema);
