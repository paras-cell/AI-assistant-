import express from "express";
import auth from "../middleware/auth.js";
import ChatHistory from "../models/ChatHistory.js";

const router = express.Router();

// Get all chat history for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const chats = await ChatHistory.find({ user: req.user }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch history" });
  }
});

// Save a new chat
router.post("/", auth, async (req, res) => {
  try {
    const { prompt, response } = req.body;
    if (!prompt || !response) return res.status(400).json({ message: "Prompt and response required" });

    const newChat = await ChatHistory.create({
      user: req.user,  // from auth middleware
      prompt,
      response,
    });
    req.io.emit("historyUpdated");
    res.status(201).json(newChat);
  } catch (err) {
    res.status(500).json({ message: "Failed to save chat", error: err.message });
  }
});

// Delete a single chat
router.delete("/:id", auth, async (req, res) => {
  try {
    await ChatHistory.findByIdAndDelete(req.params.id);
    res.json({ message: "Chat deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete chat" });
  }
});

// Delete all chats
router.delete("/", auth, async (req, res) => {
  try {
    await ChatHistory.deleteMany({ user: req.user });
    res.json({ message: "All chats deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete all chats" });
  }
});

export default router;
