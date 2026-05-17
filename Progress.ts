import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  module: { type: String, required: true },
  score: { type: Number },
  data: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

export const Progress = mongoose.model("Progress", progressSchema);
