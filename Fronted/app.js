const btn = document.getElementById("generateBtn");
const promptInput = document.getElementById("prompt");
const status = document.getElementById("status");
const video = document.getElementById("video");
const progressBar = document.getElementById("progressBar");
const ad = document.getElementById("ad");

// Cambiar URL al dominio de tu deploy
const API_BASE = "https://ai-video-platform.onrender.com/api/generate";

btn.onclick = async () => {
  const prompt = promptInput.value.trim();
  if (!prompt) return alert("Escribe tu idea primero");

  status.textContent = "Tu video está cobrando vida… ✨";
  status.classList.remove("hidden");
  video.style.opacity = 0;
  progressBar.style.width = "0%";
  ad.style.display = "block";

  try {
    // enviar prompt
    fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    }).then(res => res.json())
      .then(async (data) => {
        if (data.error) throw new Error(data.error);

        video.src = data.videoUrl;
        setTimeout(() => {
          video.style.opacity = 1;
          status.textContent = "¡Video generado con éxito! 🚀";
        }, 500);
      });

    // actualizar barra de progreso con polling
    const interval = setInterval(async () => {
      const res = await fetch(`${API_BASE}/progress`);
      const data = await res.json();
      progressBar.style.width = data.progress + "%";

      if (data.progress < 30) status.textContent = "Preparando tu idea… 💡";
      else if (data.progress < 60) status.textContent = "La IA está trabajando… 🔧";
      else if (data.progress < 90) status.textContent = "Casi listo… ⏳";
      else status.textContent = "Finalizando tu video… 🚀";

      if (data.progress >= 100) clearInterval(interval);
    }, 300);

  } catch (err) {
    status.textContent = "Error generando video: " + err.message;
  } finally {
    setTimeout(() => {
      ad.style.display = "none";
      status.classList.add("hidden");
    }, 5000);
  }
};


