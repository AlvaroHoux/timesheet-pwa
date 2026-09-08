if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Registra apontando para a raiz
    navigator.serviceWorker
      .register("../sw.js")
      .then((reg) => {
        console.log("SW registrado com sucesso. Escopo:", reg.scope);

        // Lógica para exibir o banner de atualização
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              // Se foi instalado e já existe um SW controlando a página (ou seja, é uma atualização)
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                mostrarBannerAtualizacao(newWorker);
              }
            });
          }
        });
      })
      .catch((err) => {
        console.error("Falha ao registrar SW:", err);
      });
  });

  // Garante que a página vai recarregar automaticamente assim que o novo SW assumir o controle
  let recarregando = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!recarregando) {
      window.location.reload();
      recarregando = true;
    }
  });
}

// Cria o banner dinamicamente na tela
function mostrarBannerAtualizacao(worker: ServiceWorker): void {
  let banner = document.getElementById("pwaUpdateBanner");

  if (!banner) {
    banner = document.createElement("div");
    banner.id = "pwaUpdateBanner";
    banner.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background-color: var(--primary-color, #03dac6); color: #000;
            padding: 15px 25px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
            display: flex; gap: 20px; align-items: center; z-index: 9999; font-weight: bold;
            font-family: sans-serif; white-space: nowrap;
        `;

    banner.innerHTML = `
            <span>Nova versão do App disponível!</span>
            <button id="btnAtualizarPwa" style="background: #121212; color: #fff; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 1rem;">Atualizar</button>
        `;
    document.body.appendChild(banner);
  } else {
    banner.style.display = "flex";
  }

  const btnAtualizar = document.getElementById("btnAtualizarPwa");
  if (btnAtualizar) {
    btnAtualizar.addEventListener("click", () => {
      if (banner) banner.style.display = "none";
      // Envia o sinal para o SW pular a espera e se ativar imediatamente
      worker.postMessage({ type: "SKIP_WAITING" });
    });
  }
}
