(() => {
  function initializeFavorites() {
    const api = window.ApexApi;
    const favoritesPanel = document.querySelector("#favoritos");
    const favoritesGrid = favoritesPanel?.querySelector(".lista-favoritos");
    const emptyState = favoritesPanel?.querySelector(".favoritos-vacios");
    const status = favoritesPanel?.querySelector(".estado-favoritos");
    const globalStatus = document.querySelector("#estado-favoritos-global");
    const favoritesLink = document.querySelector(".enlace-favoritos");
    if (!api || !favoritesPanel || !favoritesGrid || !emptyState || !favoritesLink) return;

    let favorites = [];
    const products = [...document.querySelectorAll(".productos-seccion:not(#favoritos) .producto")];
    const allProductCards = [...products, ...document.querySelectorAll(".categoria-preview .producto")];

    function announce(message) {
      if (status) status.textContent = message;
      if (globalStatus) globalStatus.textContent = message;
    }

    function productId(product) {
      return product.dataset.catalogProductId;
    }

    function productName(product) {
      return product.querySelector("h3")?.textContent.trim() || "";
    }

    function updateControls() {
      const count = favorites.length;
      const countText = String(count);
      const counter = favoritesLink.querySelector(".contador-favoritos");
      if (counter) counter.textContent = countText;
      favoritesLink.setAttribute(
        "aria-label",
        `Ver favoritos, ${count} ${count === 1 ? "artículo" : "artículos"}`
      );

      const selectedIds = new Set(favorites.map((item) => item.id));
      document.querySelectorAll(".boton-favorito[data-favorite-product-id]").forEach((button) => {
        const selected = selectedIds.has(button.dataset.favoriteProductId);
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
      const selectedIds = new Set(favorites.map((item) => item.id));
      const matchingProducts = products.filter((product) => selectedIds.has(productId(product)));

      matchingProducts.forEach((product) => {
        const clone = product.cloneNode(true);
        const actions = clone.querySelector(".producto-acciones");
        if (actions) {
          const name = productName(product);
          const addButton = document.createElement("button");
          addButton.type = "button";
          addButton.disabled = product.dataset.inStock === "false";
          addButton.className = "boton boton-agregar-favorito";
          addButton.dataset.addProduct = "";
          addButton.setAttribute("aria-label", addButton.disabled ? `${name} agotado` : `Añadir ${name} al carrito`);
          addButton.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2.5 3.5h2l2.1 11.1a2 2 0 0 0 2 1.6h8.7a2 2 0 0 0 1.9-1.4l2-7.3H6"></path><circle cx="9" cy="20" r="1.4"></circle><circle cx="18" cy="20" r="1.4"></circle></svg>
            <span>${addButton.disabled ? "Agotado" : "Añadir al carrito"}</span>
          `;
          actions.prepend(addButton);
        }
        favoritesGrid.append(clone);
      });
      emptyState.hidden = matchingProducts.length > 0;
      updateControls();
    }

    function makeFavoriteButton(product) {
      const name = productName(product);
      const id = productId(product);
      const actions = product.querySelector(".producto-acciones");
      if (!id || !name || !actions || actions.querySelector(".boton-favorito")) return;

      const button = document.createElement("button");
      button.className = "boton-favorito";
      button.type = "button";
      button.dataset.favoriteProductId = id;
      button.dataset.productName = name;
      button.setAttribute("aria-pressed", "false");
      button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 8.7c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z"></path></svg>';
      actions.append(button);
    }

    async function loadFavorites() {
      if (!api.getToken()) {
        favorites = [];
        updateControls();
        renderFavorites();
        announce("Inicia sesión para consultar y sincronizar tus favoritos.");
        return;
      }

      favorites = await api.listFavorites();
      updateControls();
      renderFavorites();
      announce(`${favorites.length} ${favorites.length === 1 ? "favorito sincronizado" : "favoritos sincronizados"} con tu cuenta.`);
    }

    async function toggleFavorite(button) {
      const fromFavorites = favoritesPanel.contains(button);
      try {
        const latest = await api.listFavorites();
        const productId = button.dataset.favoriteProductId;
        const wasSelected = latest.some((item) => item.id === productId);
        favorites = wasSelected
          ? await api.removeFavorite(productId)
          : await api.addFavorite(productId);
        updateControls();
        renderFavorites();
        announce(`${button.dataset.productName} ${wasSelected ? "se quitó de" : "se agregó a"} tus favoritos sincronizados.`);

        if (fromFavorites) {
          const nextButton = favoritesGrid.querySelector(".boton-favorito");
          (nextButton || favoritesPanel.querySelector("h2")).focus();
        }
      } catch (error) {
        console.error("No se pudieron sincronizar los favoritos con la API.", error);
        announce(`No se pudo actualizar tu lista de favoritos. ${error.message}`);
      }
    }

    allProductCards.forEach(makeFavoriteButton);
    updateControls();

    document.addEventListener("click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const favoritesNavigation = target.closest(".enlace-favoritos");
      if (favoritesNavigation) {
        event.preventDefault();
        window.ApexAuth.requireSession({
          opener: favoritesNavigation,
          message: "Para consultar tus favoritos sincronizados, inicia sesión o crea una cuenta.",
          onAuthenticated: () => { window.location.assign("favoritos.html"); }
        });
        return;
      }

      const button = target.closest(".boton-favorito[data-favorite-product-id]");
      if (!button) return;
      window.ApexAuth.requireSession({
        opener: button,
        message: "Inicia sesión para guardar tus favoritos en tu cuenta y tenerlos disponibles en tus dispositivos.",
        onAuthenticated: () => { toggleFavorite(button); }
      });
    });

    loadFavorites().catch((error) => {
      console.error("No se pudieron cargar los favoritos de la cuenta.", error);
      announce(`No se pudieron cargar tus favoritos desde la API. ${error.message}`);
    });

    document.addEventListener("apex:session-state", (event) => {
      if (event.detail?.user) {
        loadFavorites().catch((error) => {
          console.error("No se pudieron cargar los favoritos de la cuenta.", error);
          announce(`No se pudieron cargar tus favoritos desde la API. ${error.message}`);
        });
        return;
      }
      favorites = [];
      updateControls();
      renderFavorites();
      announce("Inicia sesión para consultar y sincronizar tus favoritos.");
    });
  }

  if (document.documentElement.dataset.catalogReady === "true") initializeFavorites();
  else document.addEventListener("catalog:ready", initializeFavorites, { once: true });
})();
