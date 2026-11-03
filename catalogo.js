(() => {
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
        <a class="enlace-texto enlace-explorar" href="categoria.html?id=${encodeURIComponent(categoryId)}">Explorar categoría <span aria-hidden="true">→</span></a>
      </div>
      <div class="controles-carrusel">
        <button class="control-carrusel control-anterior" type="button" aria-label="Ver productos anteriores de ${title}">←</button>
        <button class="control-carrusel control-siguiente" type="button" aria-label="Ver productos siguientes de ${title}">→</button>
      </div>
      <div class="carrusel-productos" tabindex="0" aria-label="Productos destacados de ${title}"></div>
    `;

    const carousel = preview.querySelector(".carrusel-productos");
    products.forEach((product) => carousel.append(product.cloneNode(true)));

    const previous = preview.querySelector(".control-anterior");
    const next = preview.querySelector(".control-siguiente");

    function updateControls() {
      const maxScroll = carousel.scrollWidth - carousel.clientWidth;
      previous.disabled = carousel.scrollLeft <= 1;
      next.disabled = carousel.scrollLeft >= maxScroll - 1;
    }

    function moveCarousel(direction) {
      const card = carousel.querySelector(".producto");
      if (!card) return;
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
      if (!window.ApexCatalog) throw new Error("El catálogo compartido no está disponible.");
      const products = await window.ApexCatalog.loadProducts();
      if (products.length === 0) {
        throw new Error("No hay productos activos con una relación de slug público configurada.");
      }

      const sections = [...document.querySelectorAll(".productos-seccion:not(#favoritos)")];
      const byCategory = new Map(sections.map((section) => [section.id, section]));
      const previews = document.createDocumentFragment();
      const counts = new Map();

      products.forEach((product, index) => {
        const section = byCategory.get(product.categoryId);
        if (!section) throw new Error(`No se encontró una sección para la categoría ${product.categoryId}.`);
        const grid = section.querySelector(".productos");
        if (!grid) throw new Error(`No se encontró la cuadrícula de ${product.categoryId}.`);
        const categoryIndex = counts.get(product.categoryId) || 0;
        grid.append(window.ApexCatalog.makeProductCard(product, categoryIndex));
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
        status.textContent = `No se pudo cargar el catálogo desde la API. ${error.message}`;
      }
      console.error("Error al cargar el catálogo de productos.", error);
      signalCatalogReady();
    }
  }

  loadCatalog();
})();
