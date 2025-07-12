//models/User.js
const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["player", "arena_owner", "admin"],
      default: "player",
    },
    profileImage: String,
    city: String,
    bio: String,
    refreshToken: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
