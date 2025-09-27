import express from "express";
import fetch from "node-fetch";

const router = express.Router();

router.post("/", async (req, res) => {
  const { prompt, model } = req.body;
  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  console.log(`🧠 Prompt: "${prompt}" | Model: ${model}`);

  try {
    const ollamaRes = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "gemma:2b",
        prompt,
        stream: true,
      }),
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    ollamaRes.body.on("data", (chunk) => {
      const raw = chunk.toString();
      try {
        const json = JSON.parse(raw);
        if (json.response) {
          res.write(`data: ${json.response}\n\n`);
          res.flush();
        }
      } catch (err) {
        console.error("❌ JSON parse error:", err);
      }
    });

    ollamaRes.body.on("end", () => res.end());
    ollamaRes.body.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.end();
    });
  } catch (err) {
    console.error("❌ Ollama error:", err);
    res.status(500).json({ error: "Ollama communication failed" });
  }
});

export default router;
