const mongoose = require("mongoose");
const { Schema } = mongoose;

const tournamentSchema = new Schema(
  {
    name: { type: String, required: true },
    organizer: { type: Schema.Types.ObjectId, ref: "User", required: true }, // arena owner
    arena: { type: Schema.Types.ObjectId, ref: "Arena", required: true },
    sport: { type: String, enum: ["cricket", "futsal"], required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },
    maxTeams: { type: Number, required: true },
    entryFee: { type: Number, default: 0 },
    prizePool: {
      first: { type: Number, default: 0 },
      second: { type: Number, default: 0 },
      third: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: ["draft", "open", "registration_closed", "in_progress", "completed", "cancelled"],
      default: "draft"
    },
    // Participants
    invitedTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    registeredTeams: [{ type: Schema.Types.ObjectId, ref: "Team" }],
    // Tournament structure
    format: {
      type: String,
      enum: ["knockout", "league", "group_knockout"],
      default: "knockout"
    },
    // Matches in tournament
    matches: [{ type: Schema.Types.ObjectId, ref: "Match" }],
    // Rules and requirements
    rules: [String],
    requirements: [String],
    // Tournament results
    winner: { type: Schema.Types.ObjectId, ref: "Team" },
    runnerUp: { type: Schema.Types.ObjectId, ref: "Team" },
    thirdPlace: { type: Schema.Types.ObjectId, ref: "Team" },
    isPublic: { type: Boolean, default: true }, // if false, only invited teams can join
    images: [String], // tournament banners, logos, etc.
  },
  { timestamps: true }
);

// Indexes for efficient queries
tournamentSchema.index({ sport: 1, status: 1 });
tournamentSchema.index({ organizer: 1, startDate: -1 });
tournamentSchema.index({ arena: 1, startDate: -1 });
tournamentSchema.index({ registrationDeadline: 1 });

module.exports = mongoose.model("Tournament", tournamentSchema);
