import express from "express";
import cors from "cors";
import compression from "compression";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import messageRoutes from "./routes/message.js";
import historyRoutes from "./routes/history.js";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
const server = http.createServer(app); // ✅ create HTTP server

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173"||"https://ai-assistant-2-ssi8.onrender.com", // ✅ frontend origin
    methods: ["GET", "POST"],
  },
});

// ✅ Attach io to every request
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());
app.use(compression({ threshold: 0 }));

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Routes
app.use("/api/message", messageRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/auth", authRoutes);

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
