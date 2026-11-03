(() => {
  const favoriteIcon = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M20.8 8.7c0 5.1-8.8 11-8.8 11s-8.8-5.9-8.8-11A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 8.8 2.7Z"></path></svg>';
  let favoriteItems = [];

  function productFavoriteId(product) {
    return product.id;
  }

  function updateFavoriteCount(favorites) {
    document.querySelectorAll(".contador-favoritos").forEach((counter) => {
      counter.textContent = String(favorites.length);
    });
    document.querySelectorAll(".enlace-favoritos").forEach((link) => {
      link.setAttribute("aria-label", `Ver favoritos, ${favorites.length} ${favorites.length === 1 ? "artículo" : "artículos"}`);
    });
  }

  function updateFavoriteButtons(favorites) {
    const ids = new Set(favorites.map((item) => typeof item === "string" ? item : item.id));
    document.querySelectorAll("[data-page-favorite-id]").forEach((button) => {
      const selected = ids.has(button.dataset.pageFavoriteId);
      button.setAttribute("aria-pressed", String(selected));
      button.setAttribute(
        "aria-label",
        `${selected ? "Quitar" : "Agregar"} ${button.dataset.productName} ${selected ? "de" : "a"} favoritos`
      );
      button.title = selected ? "Quitar de favoritos" : "Agregar a favoritos";
    });
  }

  function installProductActions(root, { addToCart = false } = {}) {
    const cards = root.matches(".producto") ? [root] : [...root.querySelectorAll(".producto")];

    cards.forEach((card) => {
      const name = card.querySelector("h3")?.textContent.trim();
      const actions = card.querySelector(".producto-acciones");
      if (!name || !actions || actions.querySelector(".boton-favorito")) return;

      const favorite = document.createElement("button");
      favorite.className = "boton-favorito";
      favorite.type = "button";
      favorite.dataset.pageFavoriteId = card.dataset.catalogProductId;
      favorite.dataset.productName = name;
      favorite.setAttribute("aria-pressed", "false");
      favorite.innerHTML = favoriteIcon;

      if (addToCart) {
        const addButton = document.createElement("button");
        addButton.className = "boton boton-agregar-favorito";
        addButton.type = "button";
        addButton.dataset.addProduct = "";
        addButton.textContent = card.dataset.inStock === "false" ? "Agotado" : "Añadir al carrito";
        addButton.disabled = card.dataset.inStock === "false";
        addButton.setAttribute("aria-label", `${addButton.disabled ? "Agotado:" : "Añadir al carrito:"} ${name}`);
        actions.append(addButton);
      }

      actions.append(favorite);
    });

    updateFavoriteCount(favoriteItems);
    updateFavoriteButtons(favoriteItems);
  }

  function showFavoriteError(error) {
    const status = document.getElementById("favorites-status")
      || document.getElementById("catalog-status")
      || document.getElementById("product-feedback");
    if (status) {
      status.hidden = false;
      status.textContent = `No se pudieron sincronizar tus favoritos con la cuenta. ${error.message}`;
    }
    console.error("No se pudieron sincronizar los favoritos con la API.", error);
  }

  async function refreshFavorites() {
    if (!window.ApexApi.getToken()) {
      favoriteItems = [];
      updateFavoriteCount(favoriteItems);
      updateFavoriteButtons(favoriteItems);
      return favoriteItems;
    }
    favoriteItems = await window.ApexApi.listFavorites();
    updateFavoriteCount(favoriteItems);
    updateFavoriteButtons(favoriteItems);
    return favoriteItems;
  }

  function initSharedFavoriteActions({ onChanged, skipInitialLoad = false } = {}) {
    if (document.documentElement.dataset.pageFavoriteActions === "true") return;
    document.documentElement.dataset.pageFavoriteActions = "true";

    document.addEventListener("click", (event) => {
      const button = event.target instanceof Element
        ? event.target.closest("[data-page-favorite-id]")
        : null;
      if (!button) return;

      if (!window.ApexAuth) {
        console.error("No se pudo abrir la autenticación para guardar favoritos.");
        const status = document.getElementById("favorites-status") || document.getElementById("catalog-status");
        if (status) status.textContent = "No se pudo comprobar tu sesión. Recarga la página e inténtalo de nuevo.";
        return;
      }

      window.ApexAuth.requireSession({
        opener: button,
        message: "Para guardar tus favoritos, inicia sesión o crea una cuenta.",
        onAuthenticated: async () => {
          try {
            const productId = button.dataset.pageFavoriteId;
            await refreshFavorites();
            const wasSelected = favoriteItems.some((item) => item.id === productId);
            favoriteItems = wasSelected
              ? await window.ApexApi.removeFavorite(productId)
              : await window.ApexApi.addFavorite(productId);
            updateFavoriteCount(favoriteItems);
            updateFavoriteButtons(favoriteItems);
            const status = document.getElementById("favorites-status")
              || document.getElementById("catalog-status")
              || document.getElementById("product-feedback");
            if (status) status.textContent = `${button.dataset.productName} ${wasSelected ? "se quitó de" : "se agregó a"} favoritos.`;
            onChanged?.(favoriteItems);
          } catch (error) {
            showFavoriteError(error);
          }
        }
      });
    });

    document.addEventListener("apex:session-state", (event) => {
      if (!event.detail?.user) {
        favoriteItems = [];
        updateFavoriteCount(favoriteItems);
        updateFavoriteButtons(favoriteItems);
        return;
      }
      refreshFavorites().catch(showFavoriteError);
    });
    if (!skipInitialLoad) refreshFavorites().catch(showFavoriteError);
  }

  function renderError(status, error) {
    status.textContent = `No se pudo cargar esta página. ${error.message}`;
    console.error("Error al cargar una página del catálogo.", error);
  }

  async function renderCategoryPage() {
    const status = document.getElementById("catalog-status");
    const grid = document.getElementById("category-products");
    const empty = document.getElementById("category-empty");
    const categoryId = new URLSearchParams(window.location.search).get("id");
    try {
      if (!categoryId || !Object.hasOwn(window.ApexCatalog.visibleCategories, categoryId)) {
        throw new Error("La categoría no está disponible en la tienda. Elige una de las categorías del menú.");
      }
      const title = window.ApexCatalog.visibleCategories[categoryId];
      document.getElementById("titulo-categoria").textContent = title;
      document.title = `${title} | Apex Sports`;
      const products = await window.ApexCatalog.loadProducts();
      const categoryProducts = products.filter((product) => product.categoryId === categoryId);
      if (!categoryProducts.length) {
        status.hidden = true;
        empty.hidden = false;
        return;
      }

      grid.replaceChildren(...categoryProducts.map((product, index) => window.ApexCatalog.makeProductCard(product, index)));
      installProductActions(grid, { addToCart: true });
      initSharedFavoriteActions();
      status.hidden = true;
    } catch (error) {
      renderError(status, error);
    }
  }

  async function renderProductPage() {
    const status = document.getElementById("product-status");
    const productId = new URLSearchParams(window.location.search).get("id");
    try {
      if (!productId) throw new Error("No se indicó qué producto quieres consultar.");
      const products = await window.ApexCatalog.loadProducts();
      const product = products.find((item) => item.id === productId);
      if (!product) throw new Error("El producto no está disponible en el catálogo.");

      const detail = product.hasLocalImageOverride
        ? null
        : await window.ApexApi.request(`/products/${encodeURIComponent(productId)}`);
      const section = document.getElementById("product-detail");
      section.dataset.productId = product.id;
      section.dataset.inStock = String(product.inStock);
      document.getElementById("product-category").textContent = product.category;
      document.getElementById("product-name").textContent = product.name;
      document.getElementById("product-price").textContent = window.ApexCatalog.formatPrice(product.priceCents);
      document.getElementById("product-description").textContent = product.description;
      document.title = `${product.name} | Apex Sports`;
      document.getElementById("product-add").disabled = !product.inStock;
      document.getElementById("product-add").textContent = product.inStock ? "Añadir al carrito" : "Agotado";
      document.getElementById("product-back").href = `categoria.html?id=${encodeURIComponent(product.categoryId)}`;

      const image = document.getElementById("product-image");
      const gallery = product.hasLocalImageOverride
        ? product.imageUrls
        : [product.imageUrl, ...(Array.isArray(detail?.images) ? detail.images.map((item) => item?.url) : [])]
        .filter((url, index, urls) => typeof url === "string" && url && urls.indexOf(url) === index);
      const thumbnails = document.getElementById("product-thumbnails");
      const renderImage = (url, index) => {
        image.src = url;
        image.alt = `${product.name}, vista ${index + 1}`;
        thumbnails.querySelectorAll("button").forEach((button) => {
          button.setAttribute("aria-pressed", String(button.dataset.imageIndex === String(index)));
        });
      };
      image.width = 360;
      image.height = 300;
      thumbnails.hidden = gallery.length < 2;
      thumbnails.replaceChildren(...gallery.map((url, index) => {
        const button = document.createElement("button");
        button.className = "detalle-miniatura";
        button.type = "button";
        button.dataset.imageIndex = String(index);
        button.setAttribute("aria-label", `Ver imagen ${index + 1} de ${product.name}`);
        button.setAttribute("aria-pressed", String(index === 0));
        const thumb = document.createElement("img");
        thumb.src = url;
        thumb.alt = "";
        thumb.width = 76;
        thumb.height = 76;
        button.append(thumb);
        button.addEventListener("click", () => renderImage(url, index));
        return button;
      }));
      renderImage(gallery[0], 0);

      const related = products.filter((item) => item.id !== product.id && item.categoryId === product.categoryId).slice(0, 3);
      const relatedGrid = document.getElementById("related-products");
      relatedGrid.replaceChildren(...related.map((item, index) => window.ApexCatalog.makeProductCard(item, index)));
      installProductActions(relatedGrid, { addToCart: true });
      initSharedFavoriteActions();

      const quantity = document.getElementById("product-quantity");
      const decrease = document.getElementById("quantity-decrease");
      const increase = document.getElementById("quantity-increase");
      const updateQuantity = () => {
        const value = Number(quantity.value);
        decrease.disabled = !Number.isSafeInteger(value) || value <= 1;
        increase.disabled = !Number.isSafeInteger(value) || value >= 99;
        section.dataset.quantity = String(value);
      };
      decrease.addEventListener("click", () => {
        quantity.value = String(Math.max(1, Number(quantity.value) - 1));
        updateQuantity();
      });
      increase.addEventListener("click", () => {
        quantity.value = String(Math.min(99, Number(quantity.value) + 1));
        updateQuantity();
      });
      quantity.addEventListener("input", updateQuantity);
      quantity.addEventListener("blur", () => {
        const value = Number(quantity.value);
        quantity.value = String(Number.isSafeInteger(value) ? Math.min(99, Math.max(1, value)) : 1);
        updateQuantity();
      });
      updateQuantity();

      const favoriteButton = document.getElementById("product-favorite");
      favoriteButton.dataset.pageFavoriteId = productFavoriteId(product);
      favoriteButton.dataset.productName = product.name;
      favoriteButton.innerHTML = favoriteIcon;
      updateFavoriteCount(favoriteItems);
      updateFavoriteButtons(favoriteItems);
      section.hidden = false;
      status.hidden = true;
    } catch (error) {
      renderError(status, error);
    }
  }

  async function renderFavoritesPage() {
    const status = document.getElementById("favorites-status");
    const grid = document.getElementById("favorite-products");
    const empty = document.getElementById("favorites-empty");

    function render(products, favorites) {
      const ids = new Set(favorites.map((item) => item.id));
      const matching = products.filter((product) => ids.has(productFavoriteId(product)));
      grid.replaceChildren(...matching.map((product, index) => window.ApexCatalog.makeProductCard(product, index)));
      installProductActions(grid, { addToCart: true });
      updateFavoriteCount(favorites);
      updateFavoriteButtons(favorites);
      empty.hidden = matching.length > 0;
      status.textContent = matching.length
        ? `${matching.length} ${matching.length === 1 ? "producto guardado" : "productos guardados"}.`
        : "Aún no guardaste productos.";
    }

    try {
      if (!window.ApexApi.getToken()) {
        window.ApexAuth.requireSession({
          message: "Para consultar tus favoritos, inicia sesión o crea una cuenta.",
          onAuthenticated: () => renderFavoritesPage(),
          onCancel: () => window.location.replace("index.html")
        });
        status.textContent = "Inicia sesión para consultar tus favoritos.";
        return;
      }
      const [products, favorites] = await Promise.all([
        window.ApexCatalog.loadProducts(),
        window.ApexApi.listFavorites()
      ]);
      favoriteItems = favorites;
      render(products, favorites);
      initSharedFavoriteActions({
        onChanged: (updated) => render(products, updated),
        skipInitialLoad: true
      });
    } catch (error) {
      if (!window.ApexApi.getToken()) {
        window.ApexAuth.requireSession({
          message: "Tu sesión ya no está activa. Inicia sesión para consultar tus favoritos.",
          onAuthenticated: () => renderFavoritesPage(),
          onCancel: () => window.location.replace("index.html")
        });
        status.textContent = "Inicia sesión para consultar tus favoritos.";
      } else {
        renderError(status, error);
      }
    }
  }

  function initializePage() {
    const page = document.body.dataset.catalogPage;
    if (page === "category") renderCategoryPage();
    if (page === "product") renderProductPage();
    if (page === "favorites") renderFavoritesPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, { once: true });
  } else {
    initializePage();
  }
})();
