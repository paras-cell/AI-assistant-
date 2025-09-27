// server/models/ChatHistory.js
import mongoose from "mongoose";

const chatSchema = mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    prompt: { type: String, required: true },
    response: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("ChatHistory", chatSchema);
