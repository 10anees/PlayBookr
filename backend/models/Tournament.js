const tournamentSchema = new Schema({
  name: { type: String, required: true },
  sport: { type: String, enum: ['cricket', 'futsal'], required: true },
  arena: { type: Schema.Types.ObjectId, ref: 'Arena', required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // arena owner
  description: String,
  teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
  schedule: [{
    match: { type: Schema.Types.ObjectId, ref: 'Match' },
    date: Date,
  }],
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', tournamentSchema);
