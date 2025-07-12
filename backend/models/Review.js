const reviewSchema = new Schema({
  arena: { type: Schema.Types.ObjectId, ref: 'Arena', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String,
  photos: [String],
  match: { type: Schema.Types.ObjectId, ref: 'Match' }, // optional
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
