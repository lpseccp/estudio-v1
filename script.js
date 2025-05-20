document.getElementById("uploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const imageInput = document.getElementById("image");
  const dressInput = document.getElementById("dress");
  const resultImage = document.getElementById("resultImage");

  if (!imageInput.files[0]) {
    alert("Por favor, envie uma imagem.");
    return;
  }

  const formData = new FormData();
  formData.append("file", imageInput.files[0]);

  const model = "your-username/your-model"; // Substitua pelo seu modelo do Replicate
  const replicateApiKey = "your_replicate_api_key"; // Substitua pela sua chave de API

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateApiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "versão-do-modelo", // Ex: 123abc456def... (pego no site do modelo no Replicate)
        input: {
          image: await toBase64(imageInput.files[0]),
          prompt: `a person wearing a ${dressInput.value}`
        }
      })
    });

    const result = await response.json();
    console.log(result);

    if (result?.error || !result?.urls?.get) {
      throw new Error(result?.error || "Erro ao iniciar a geração da imagem.");
    }

    // Polling para pegar o resultado final
    const final = await checkPrediction(result.urls.get, replicateApiKey);

    if (final?.output) {
      resultImage.src = final.output;
    } else {
      throw new Error("A geração falhou.");
    }

  } catch (err) {
    console.error(err);
    alert("Erro inesperado. Verifique o console.");
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
    if (data.status === "succeeded") return data;
    if (data.status === "failed") throw new Error("Predição falhou.");

    await new Promise(r => setTimeout(r, 2000));
  }
}
