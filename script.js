document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const imageInput = document.getElementById("image");
  const dressInput = document.getElementById("dress");
  const resultImage = document.getElementById("resultImage");

  if (!imageInput.files[0]) {
    alert("Por favor, envie uma imagem.");
    return;
  }

  const replicateApiKey = "r8_EiaYJn3pY3N583gaYlQArD7cGJbxfN81VoUbS";
  const versionId = "278a81e7ebb22db98bcba54de985d22cc1abeead2754eb1f2af717247be69b34";

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: versionId,
        input: {
          image: await toBase64(imageInput.files[0]),
          prompt: `a person wearing a ${dressInput.value}`
        }
      })
    });

    const result = await response.json();
    console.log("Início:", result);

    if (result?.error || !result?.urls?.get) {
      throw new Error(result?.error || "Erro ao iniciar a geração da imagem.");
    }

    // Verifica status da predição
    const final = await checkPrediction(result.urls.get, replicateApiKey);

    if (final?.output && final.output.length > 0) {
      resultImage.src = final.output[0];
    } else {
      throw new Error("A geração falhou.");
    }

  } catch (err) {
    console.error("Erro:", err);
    alert("Erro inesperado. Verifique o console para mais detalhes.");
  }
});

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}

async function checkPrediction(url, token) {
  while (true) {
    const res = await fetch(url, {
      headers: {
        "Authorization": `Token ${token}`
      }
    });

    const data = await res.json();
    console.log("Status:", data.status);

    if (data.status === "succeeded") return data;
    if (data.status === "failed") throw new Error("Predição falhou.");

    await new Promise(r => setTimeout(r, 2000));
  }
}
