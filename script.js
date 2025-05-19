let imagemBase64 = "";

document.getElementById("photoUpload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    imagemBase64 = event.target.result;
    document.getElementById("resultImage").src = imagemBase64; // preview inicial
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});

async function gerarImagem() {
  const vestido = document.getElementById("dressSelect").value;

  if (!imagemBase64) {
    alert("Envie uma imagem sua primeiro.");
    return;
  }

  const vestidos = {
    vestido1: "https://i.imgur.com/XFVy1YF.png", // Exemplo: vestido vermelho sem fundo
    vestido2: "https://i.imgur.com/KD8iPSy.png"  // Exemplo: vestido azul sem fundo
  };

  const imagemVestidoUrl = vestidos[vestido];

  const replicateToken = "SEU_TOKEN_AQUI"; // Substitua pelo seu token da Replicate

  try {
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${replicateToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        version: "d5f3c95f8ca94dc9243e8e091b9b746cd4f1ff043014d30834c2f9bdbf6cc74f",
        input: {
          image: imagemBase64,
          clothing_image: imagemVestidoUrl
        }
      })
    });

    const prediction = await response.json();

    if (!prediction?.urls?.get) {
      alert("Erro ao enviar imagem para IA.");
      return;
    }

    // Aguarda o processamento
    let outputUrl = null;
    while (!outputUrl) {
      const statusResponse = await fetch(prediction.urls.get, {
        headers: {
          "Authorization": `Token ${replicateToken}`
        }
      });
      const statusData = await statusResponse.json();

      if (statusData.status === "succeeded") {
        outputUrl = statusData.output;
        document.getElementById("resultImage").src = outputUrl;
      } else if (statusData.status === "failed") {
        alert("A geração falhou.");
        break;
      }

      await new Promise(resolve => setTimeout(resolve, 2000)); // espera 2s antes de checar novamente
    }

  } catch (error) {
    console.error("Erro ao gerar imagem:", error);
    alert("Erro inesperado. Verifique o console.");
  }
}

// Ativa o service worker para PWA
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("Service Worker registrado com sucesso."))
    .catch(err => console.error("Erro ao registrar Service Worker:", err));
}
