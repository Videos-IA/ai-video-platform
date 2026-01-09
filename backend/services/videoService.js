import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

let queue = [];
let processing = false;

async function processQueue() {
  if (processing || queue.length === 0) return;
  processing = true;

  const { prompt, resolve, reject, onProgress } = queue.shift();

  try {
    // Simulación de progreso en pasos
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      onProgress(progress);
      if (progress >= 100) clearInterval(interval);
    }, 300);

    // Llamada real a la API Veo
    const response = await fetch(process.env.VEO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.VEO_API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        length_seconds: 10,
        resolution: "720p"
      })
    });

    const data = await response.json();
    if (!data.url) throw new Error("No se generó video");

    onProgress(100);
    resolve(data.url);

  } catch (err) {
    reject(err);
  } finally {
    processing = false;
    processQueue();
  }
}

export function generateVideo(prompt, onProgress) {
  return new Promise((resolve, reject) => {
    queue.push({ prompt, resolve, reject, onProgress });
    processQueue();
  });
}

