// models/Match.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const matchSchema = new Schema(
  {
    homeTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    awayTeam: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    arena: { type: Schema.Types.ObjectId, ref: "Arena", required: true },
    booking: { type: Schema.Types.ObjectId, ref: "Booking", required: true },
    sport: { type: String, enum: ["cricket", "futsal"], required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: {
      type: String,
      enum: ["scheduled", "in_progress", "completed", "cancelled"],
      default: "scheduled"
    },
    // Match results
    homeTeamScore: Number,
    awayTeamScore: Number,
    winner: { type: Schema.Types.ObjectId, ref: "Team" },
    // Sport-specific stats
    matchStats: {
      // For futsal
      homeTeamGoals: { type: Number, default: 0 },
      awayTeamGoals: { type: Number, default: 0 },
      // For cricket
      homeTeamRuns: { type: Number, default: 0 },
      awayTeamRuns: { type: Number, default: 0 },
      homeTeamWickets: { type: Number, default: 0 },
      awayTeamWickets: { type: Number, default: 0 },
    },
    // Player stats for MVP
    playerStats: [{
      player: { type: Schema.Types.ObjectId, ref: "User" },
      team: { type: Schema.Types.ObjectId, ref: "Team" },
      goals: { type: Number, default: 0 }, // for futsal
      runs: { type: Number, default: 0 }, // for cricket
      wickets: { type: Number, default: 0 }, // for cricket
      isMVP: { type: Boolean, default: false }
    }],
    // Challenge details
    challengedBy: { type: Schema.Types.ObjectId, ref: "Team" },
    challengeAccepted: { type: Boolean, default: false },
    challengeMessage: String,
    // Match feedback
    feedback: [{
      player: { type: Schema.Types.ObjectId, ref: "User" },
      rating: { type: Number, min: 1, max: 5 },
      comment: String,
      createdAt: { type: Date, default: Date.now }
    }],
    notes: String,
  },
  { timestamps: true }
);

// Indexes for efficient queries
matchSchema.index({ homeTeam: 1, date: 1 });
matchSchema.index({ awayTeam: 1, date: 1 });
matchSchema.index({ arena: 1, date: 1 });
matchSchema.index({ status: 1 });

module.exports = mongoose.model("Match", matchSchema);
