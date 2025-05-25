<script>
  document.getElementById("uploadForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const imageInput = document.getElementById("image");
    const dressInput = document.getElementById("dress");
    const resultImage = document.getElementById("resultImage");

    if (!imageInput.files[0]) {
      alert("Por favor, envie uma imagem.");
      return;
    }

    const base64Image = await toBase64(imageInput.files[0]);

    const response = await fetch("https://nifty-dawn-ziconium.glitch.me/gerar-imagem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64Image,
        vestido: dressInput.value
      })
    });

    const data = await response.json();

    if (data?.url) {
      await esperarEExibirResultado(data.url);
    } else {
      alert("Erro ao iniciar a geração.");
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

  async function esperarEExibirResultado(url) {
    const resultImage = document.getElementById("resultImage");

    while (true) {
      const res = await fetch(url);
      const json = await res.json();

      if (json.status === "succeeded") {
        resultImage.src = json.output[0];
        break;
      }

      if (json.status === "failed") {
        alert("A geração falhou.");
        break;
      }

      await new Promise(r => setTimeout(r, 2000));
    }
  }
</script>
