import express from "express";
import { generateVideo } from "../services/videoService.js";

const router = express.Router();

// Limites por IP
const userLimits = {};
const progressMap = {};

router.post("/", async (req, res) => {
  const ip = req.ip;
  const { prompt } = req.body;

  if (!userLimits[ip]) userLimits[ip] = { count: 0, last: Date.now() };
  const now = Date.now();
  if (now - userLimits[ip].last > 24 * 60 * 60 * 1000) {
    userLimits[ip].count = 0;
    userLimits[ip].last = now;
  }

  if (userLimits[ip].count >= 3) {
    return res.status(429).json({ error: "Has alcanzado el límite de videos diarios" });
  }

  userLimits[ip].count++;
  progressMap[ip] = 0;

  try {
    const videoUrl = await generateVideo(prompt, (progress) => {
      progressMap[ip] = progress;
    });
    delete progressMap[ip];
    res.json({ videoUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error generando video" });
  }
});

// Endpoint de progreso
router.get("/progress", (req, res) => {
  const ip = req.ip;
  const progress = progressMap[ip] || 0;
  res.json({ progress });
});

export default router;
