(() => {
  const storageKey = "apex-sports-favoritos-v1";
  const favoritesPanel = document.querySelector("#favoritos");
  const favoritesGrid = favoritesPanel.querySelector(".lista-favoritos");
  const emptyState = favoritesPanel.querySelector(".favoritos-vacios");
  const status = favoritesPanel.querySelector(".estado-favoritos");
  const globalStatus = document.querySelector("#estado-favoritos-global");
  const favoritesLink = document.querySelector(".enlace-favoritos");
  let storageAvailable = true;
  let favorites = [];

  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
        favorites = [...new Set(parsed)];
      } else {
        announce("No pudimos leer la lista guardada. Puedes crear una nueva.");
        console.error("La lista de favoritos guardada tiene un formato no válido.");
      }
    }
  } catch (error) {
    storageAvailable = false;
    announce("No se pudo acceder al almacenamiento del navegador. La lista durará solo mientras esta página esté abierta.");
    console.error("No se pudo leer la lista de favoritos del navegador.", error);
  }

  const products = [...document.querySelectorAll(".productos-seccion:not(#favoritos) .producto")];
  const allProductCards = [...document.querySelectorAll(
    ".productos-seccion:not(#favoritos) .producto, .categoria-preview .producto"
  )];

  function productName(product) {
    return product.querySelector("h3").textContent.trim();
  }

  function announce(message) {
    status.textContent = message;
    globalStatus.textContent = message;
  }

  function updateControls() {
    const count = favorites.length;
    const countText = String(count);
    favoritesLink.querySelector(".contador-favoritos").textContent = countText;
    favoritesLink.setAttribute(
      "aria-label",
      `Ver favoritos, ${count} ${count === 1 ? "artículo" : "artículos"}`
    );

    document.querySelectorAll(".boton-favorito").forEach((button) => {
      const selected = favorites.includes(button.dataset.productId);
      const name = button.dataset.productName;
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute(
        "aria-label",
        `${selected ? "Quitar" : "Agregar"} ${name} ${selected ? "de" : "a"} favoritos`
      );
      button.title = selected ? "Quitar de favoritos" : "Agregar a favoritos";
    });
  }

  function renderFavorites() {
    favoritesGrid.replaceChildren();
    const matchingProducts = products.filter((product) =>
      favorites.includes(product.dataset.productId)
    );

    matchingProducts.forEach((product) => {
      favoritesGrid.append(product.cloneNode(true));
    });
    emptyState.hidden = matchingProducts.length > 0;
    updateControls();
  }

  allProductCards.forEach((product) => {
    const name = productName(product);
    const productId = name.toLocaleLowerCase("es").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    product.dataset.productId = productId;

    const button = document.createElement("button");
    button.className = "boton-favorito";
    button.type = "button";
    button.dataset.productId = productId;
    button.dataset.productName = name;
    button.setAttribute("aria-pressed", "false");
    button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 8.7c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z"></path></svg>';
    product.querySelector(".producto-imagen").append(button);
  });

  document.addEventListener("click", (event) => {
    const button = event.target.closest(".boton-favorito");
    if (!button) return;

    const fromFavorites = favoritesPanel.contains(button);
    const name = button.dataset.productName;
    const productId = button.dataset.productId;
    const wasSelected = favorites.includes(productId);
    favorites = wasSelected
      ? favorites.filter((item) => item !== productId)
      : [...favorites, productId];
    let saveFailed = false;

    if (storageAvailable) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(favorites));
      } catch (error) {
        storageAvailable = false;
        saveFailed = true;
        console.error("No se pudo guardar la lista de favoritos en el navegador.", error);
      }
    }

    announce(saveFailed
      ? "No se pudo guardar en este navegador. La lista durará solo mientras esta página esté abierta."
      : `${name} ${wasSelected ? "se quitó de" : "se agregó a"} favoritos.`);
    renderFavorites();

    if (fromFavorites) {
      const nextButton = favoritesGrid.querySelector(".boton-favorito");
      (nextButton || favoritesPanel.querySelector("h2")).focus();
    }
  });

  renderFavorites();
})();
