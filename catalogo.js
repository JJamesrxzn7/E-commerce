(() => {
  function formatPrice(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  function makeProductCard(product, index) {
    const card = document.createElement("article");
    card.className = "producto";
    card.dataset.catalogProductId = product.id;
    card.dataset.categoryId = product.categoryId;
    card.dataset.catalogIndex = String(index);

    const link = document.createElement("a");
    link.className = "producto-enlace";
    link.href = `#producto/${encodeURIComponent(product.id)}`;
    link.setAttribute("aria-label", `Ver detalles de ${product.name}`);

    const imageContainer = document.createElement("div");
    imageContainer.className = `producto-imagen imagen-${product.categoryId}`;
    const image = document.createElement("img");
    image.className = "imagen-catalogo";
    image.src = product.imageUrl;
    image.alt = product.imageAlt;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      console.error(`No se pudo cargar la ilustración local de ${product.name}: ${product.imageUrl}`);
      imageContainer.dataset.imageError = "true";
      image.alt = `No se pudo cargar la ilustración de ${product.name}`;
    }, { once: true });
    imageContainer.append(image);

    const info = document.createElement("div");
    info.className = "producto-info";
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
    const details = document.createElement("div");
    details.className = "producto-detalle";
    details.append(category, name, description, price);
    info.append(details);
    link.append(imageContainer, info);

    const actions = document.createElement("div");
    actions.className = "producto-acciones";
    card.append(link, actions);
    return card;
  }

  function addCarousel(categoryId, section) {
    const title = section.querySelector("h2").textContent.trim();
    const products = [...section.querySelectorAll(".productos > .producto")].slice(0, 10);
    const preview = document.createElement("section");
    preview.className = "seccion-catalogo categoria-preview";
    preview.setAttribute("aria-labelledby", `titulo-${categoryId}`);
    preview.innerHTML = `
      <div class="titulo-seccion">
        <div>
          <p class="sobrelinea">SELECCIÓN PARA TI</p>
          <h2 id="titulo-${categoryId}">${title}</h2>
        </div>
        <a class="enlace-texto enlace-explorar" href="#${categoryId}">Explorar categoría <span aria-hidden="true">→</span></a>
      </div>
      <div class="controles-carrusel">
        <button class="control-carrusel control-anterior" type="button" aria-label="Ver productos anteriores de ${title}">←</button>
        <button class="control-carrusel control-siguiente" type="button" aria-label="Ver productos siguientes de ${title}">→</button>
      </div>
      <div class="carrusel-productos" tabindex="0" aria-label="Productos destacados de ${title}"></div>
    `;

    const carousel = preview.querySelector(".carrusel-productos");
    products.forEach((product) => carousel.append(product.cloneNode(true)));

    const more = document.createElement("a");
    more.className = "tarjeta-ver-mas";
    more.href = `#${categoryId}`;
    more.setAttribute("aria-label", `Ver todos los productos de ${title}`);
    more.innerHTML = `
      <span class="icono-mas" aria-hidden="true">+</span>
      <strong>Ver más</strong>
      <span>Explora toda la categoría ${title}</span>
    `;
    carousel.append(more);

    const previous = preview.querySelector(".control-anterior");
    const next = preview.querySelector(".control-siguiente");

    function updateControls() {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      previous.disabled = carousel.scrollLeft <= 1;
      next.disabled = carousel.scrollLeft >= maxScroll - 1;
    }

    function moveCarousel(direction) {
      const card = carousel.querySelector(".producto, .tarjeta-ver-mas");
      const gap = parseFloat(getComputedStyle(carousel).columnGap) || 16;
      const amount = card.getBoundingClientRect().width + gap;
      carousel.scrollBy({
        left: amount * direction,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }

    previous.addEventListener("click", () => moveCarousel(-1));
    next.addEventListener("click", () => moveCarousel(1));
    carousel.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    requestAnimationFrame(updateControls);
    return preview;
  }

  function signalCatalogReady() {
    document.documentElement.dataset.catalogReady = "true";
    document.dispatchEvent(new Event("catalog:ready"));
  }

  async function loadCatalog() {
    const status = document.getElementById("catalog-status");
    try {
      const response = await fetch("data/products.json");
      if (!response.ok) throw new Error(`No se pudo cargar data/products.json (${response.status}).`);
      const data = await response.json();
      if (!data || data.version !== 1 || !Array.isArray(data.products)) {
        throw new Error("El archivo data/products.json no tiene el formato esperado.");
      }

      const sections = [...document.querySelectorAll(".productos-seccion:not(#favoritos)")];
      const byCategory = new Map(sections.map((section) => [section.id, section]));
      const previews = document.createDocumentFragment();
      const counts = new Map();

      data.products.forEach((product, index) => {
        const section = byCategory.get(product.categoryId);
        if (!section
          || typeof product.id !== "string"
          || typeof product.name !== "string"
          || typeof product.category !== "string"
          || typeof product.description !== "string"
          || !Number.isSafeInteger(product.priceCents)
          || product.priceCents < 0
          || typeof product.imageUrl !== "string"
          || !/^(?:images\/products\/[a-z0-9-]+\.svg|https:\/\/)/.test(product.imageUrl)
          || typeof product.imageAlt !== "string"
          || typeof product.imageCredit !== "string"
          || typeof product.imageLicense !== "string"
          || typeof product.imageLicenseUrl !== "string"
          || typeof product.imageSourceUrl !== "string"
          || !/^(?:https:\/\/|#licencias-de-imagenes$)/.test(product.imageLicenseUrl)
          || !/^(?:https:\/\/|images\/products\/[a-z0-9-]+\.svg$)/.test(product.imageSourceUrl)
        ) {
          throw new Error(`El producto ${index + 1} en data/products.json tiene datos incompletos o inválidos.`);
        }
        const grid = section.querySelector(".productos");
        if (!grid) throw new Error(`No se encontró la cuadrícula de ${product.categoryId}.`);
        const categoryIndex = counts.get(product.categoryId) || 0;
        grid.append(makeProductCard(product, categoryIndex));
        counts.set(product.categoryId, categoryIndex + 1);
      });

      sections.forEach((section) => {
        if (counts.has(section.id)) previews.append(addCarousel(section.id, section));
      });
      document.querySelector("#productos").after(previews);
      signalCatalogReady();
    } catch (error) {
      if (status) {
        status.hidden = false;
        status.textContent = `No se pudo cargar el catálogo. ${error.message} Abre el proyecto mediante un servidor local y vuelve a intentarlo.`;
      }
      console.error("Error al cargar el catálogo de productos.", error);
      signalCatalogReady();
    }
  }

  loadCatalog();
})();
