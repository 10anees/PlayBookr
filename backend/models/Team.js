const teamSchema = new Schema(
  {
    name: { type: String, required: true },
    captain: { type: Schema.Types.ObjectId, ref: "User", required: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User" }],
    sport: { type: String, enum: ["cricket", "futsal"], required: true },
    city: String,
    logo: String,
    total_matches: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", teamSchema);
