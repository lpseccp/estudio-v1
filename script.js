let imagemBase64 = "";

document.getElementById("photoUpload").addEventListener("change", function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = function(event) {
    imagemBase64 = event.target.result;
    document.getElementById("resultImage").src = imagemBase64; // Exibe preview
  };

  if (file) {
    reader.readAsDataURL(file);
  }
});

function gerarImagem() {
  const vestido = document.getElementById("dressSelect").value;

  alert("Em breve isso enviará para a API com o vestido: " + vestido);

  // Futuro: envio para o Replicate
  // fetch('/api/...')
  if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service-worker.js')
    .then(() => console.log("Service Worker registrado"));
}
}