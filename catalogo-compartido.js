(() => {
  const categories = {
    futbol: "Fútbol",
    basketball: "Basketball",
    tennis: "Tennis",
    mma: "Artes marciales",
    volleyball: "Volleyball",
    ropa: "Ropa deportiva",
    running: "Running",
    ciclismo: "Ciclismo",
    fitness: "Fitness",
    natacion: "Natación",
    outdoor: "Outdoor",
    accesorios: "Accesorios"
  };
  const visibleCategories = Object.freeze(
    Object.fromEntries(Object.entries(categories).slice(0, 4))
  );
  const visibleCategoryIds = new Set(Object.keys(visibleCategories));
  const maxProductsPerCategory = 10;
  const userPhotoSourceTitle = "Fotografía de producto aportada por el usuario";

  function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  async function loadProductImageOverrides() {
    const response = await fetch("data/products.json");
    if (!response.ok) {
      throw new Error(`No se pudieron cargar las fotografías del catálogo (${response.status}).`);
    }

    const fixture = await response.json();
    if (!fixture || !Array.isArray(fixture.products)) {
      throw new Error("El archivo local de fotografías del catálogo no es válido.");
    }

    return new Map(fixture.products
      .filter((product) => product?.imageSourceTitle === userPhotoSourceTitle)
      .map((product) => {
        if (typeof product.id !== "string"
          || typeof product.imageUrl !== "string"
          || !product.imageUrl.startsWith("images/products/")
          || !Array.isArray(product.imageUrls)
          || !product.imageUrls.every((url) => typeof url === "string" && url.startsWith("images/products/"))) {
          throw new Error(`La fotografía local de ${product.name || product.id || "un producto"} no es válida.`);
        }
        return [product.id, {
          imageUrl: product.imageUrl,
          imageUrls: product.imageUrls,
          imageAlt: product.imageAlt,
          hasLocalImageOverride: true
        }];
      }));
  }

  async function loadProducts() {
    if (!window.ApexApi) throw new Error("El cliente de la API no está disponible.");

    const imageOverrides = await loadProductImageOverrides();
    const pageSize = 100;
    const products = [];
    let total = null;
    while (total === null || products.length < total) {
      const data = await window.ApexApi.request(`/products?limit=${pageSize}&offset=${products.length}`);
      if (!data || !Array.isArray(data.items) || !Number.isSafeInteger(data.total) || data.total < 0) {
        throw new Error("La API devolvió un catálogo inválido.");
      }
      if (total !== null && total !== data.total) {
        throw new Error("El catálogo cambió mientras se cargaba. Vuelve a intentarlo.");
      }
      total = data.total;
      if (data.items.length === 0 && products.length < total) {
        throw new Error("La API no devolvió todos los productos del catálogo.");
      }
      products.push(...data.items);
    }

    const catalogProducts = products.map((product, index) => {
      if (typeof product.id !== "string"
        || typeof product.categoryId !== "string"
        || typeof product.name !== "string"
        || typeof product.categoryLabel !== "string"
        || typeof product.description !== "string"
        || !Number.isSafeInteger(product.priceCents)
        || product.priceCents < 0
        || typeof product.imageUrl !== "string"
        || typeof product.inStock !== "boolean"
      ) {
        throw new Error(`El producto ${index + 1} del catálogo tiene datos incompletos o inválidos.`);
      }
      const imageOverride = imageOverrides.get(product.id);
      return {
        ...product,
        ...imageOverride,
        category: product.categoryLabel,
        imageAlt: imageOverride?.imageAlt || `${product.name}. ${product.description}`
      };
    });

    const categoryCounts = new Map();
    return catalogProducts.filter((product) => {
      if (!visibleCategoryIds.has(product.categoryId) || !product.inStock) return false;
      const count = categoryCounts.get(product.categoryId) || 0;
      if (count >= maxProductsPerCategory) return false;
      categoryCounts.set(product.categoryId, count + 1);
      return true;
    });
  }

  function makeProductCard(product, index = 0) {
    const card = document.createElement("article");
    card.className = "producto";
    card.dataset.catalogProductId = product.id;
    card.dataset.categoryId = product.categoryId;
    card.dataset.catalogIndex = String(index);
    card.dataset.inStock = String(product.inStock);
    if (product.hasLocalImageOverride) card.dataset.localImageOverride = "true";

    const link = document.createElement("a");
    link.className = "producto-enlace";
    link.href = `producto.html?id=${encodeURIComponent(product.id)}`;
    link.setAttribute("aria-label", `Ver detalles de ${product.name}`);

    const imageContainer = document.createElement("div");
    imageContainer.className = `producto-imagen imagen-${product.categoryId}`;
    const image = document.createElement("img");
    image.className = "imagen-catalogo";
    image.src = product.imageUrl;
    image.alt = product.imageAlt;
    image.width = 360;
    image.height = 300;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      console.error(`No se pudo cargar la imagen local de ${product.name}: ${product.imageUrl}`);
      imageContainer.dataset.imageError = "true";
      image.alt = `No se pudo cargar la imagen de ${product.name}`;
    }, { once: true });
    imageContainer.append(image);

    const info = document.createElement("div");
    info.className = "producto-info";
    const detail = document.createElement("div");
    detail.className = "producto-detalle";
    const category = document.createElement("p");
    category.className = "producto-categoria";
    category.textContent = product.category;
    const name = document.createElement("h3");
    name.textContent = product.name;
    const description = document.createElement("p");
    description.className = "descripcion-producto";
    description.textContent = product.description;
    const price = document.createElement("p");
    price.className = "precio";
    price.textContent = formatPrice(product.priceCents);
    detail.append(category, name, description, price);
    info.append(detail);
    link.append(imageContainer, info);

    const actions = document.createElement("div");
    actions.className = "producto-acciones";
    card.append(link, actions);
    return card;
  }

  window.ApexCatalog = Object.freeze({ categories, visibleCategories, formatPrice, loadProducts, makeProductCard });
})();
