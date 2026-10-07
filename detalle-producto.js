(() => {
  function initializeProductDetails() {
    const detailSection = document.getElementById("detalle-producto");
    const relatedGrid = document.getElementById("productos-relacionados");
    const backLink = document.getElementById("detalle-volver");
    const addButton = document.getElementById("detalle-agregar");
    const status = document.getElementById("detalle-estado");
    const quantityInput = document.getElementById("detalle-cantidad");
    const decreaseQuantity = document.getElementById("detalle-cantidad-menos");
    const increaseQuantity = document.getElementById("detalle-cantidad-mas");
    const products = new Map(
      [...document.querySelectorAll(".productos-seccion:not(#favoritos) .productos > .producto")]
        .map((card) => [card.dataset.catalogProductId, card])
    );

    function renderRelatedProducts(productId, categoryId) {
      const sameCategory = [...products.values()]
        .filter((card) => card.dataset.categoryId === categoryId && card.dataset.catalogProductId !== productId);
      const otherCategories = [...products.values()]
        .filter((card) => card.dataset.categoryId !== categoryId);
      relatedGrid.replaceChildren(...[...sameCategory, ...otherCategories]
        .slice(0, 6)
        .map((card) => card.cloneNode(true)));
    }

    function closeDetails() {
      document.body.classList.remove("producto-detalle-activo");
      detailSection.hidden = true;
      status.textContent = "";
      document.title = "Apex Sports | Deporte para todos los días";
    }

    function updateQuantityControls() {
      const quantity = Number(quantityInput.value);
      decreaseQuantity.disabled = !Number.isSafeInteger(quantity) || quantity <= 1;
      increaseQuantity.disabled = quantity >= Number.MAX_SAFE_INTEGER;
    }

    function adjustQuantity(amount) {
      let quantity = Number(quantityInput.value);
      if (!Number.isSafeInteger(quantity) || quantity < 1) quantity = 1;
      quantityInput.value = String(Math.min(Number.MAX_SAFE_INTEGER, Math.max(1, quantity + amount)));
      updateQuantityControls();
    }

    function renderDetails() {
      const match = window.location.hash.match(/^#producto\/(.+)$/);
      if (!match) {
        closeDetails();
        return;
      }

      let productId;
      try {
        productId = decodeURIComponent(match[1]);
      } catch (error) {
        console.error("La dirección del producto contiene un identificador inválido.", error);
        closeDetails();
        return;
      }

      const productCard = products.get(productId);
      if (!productCard) {
        closeDetails();
        return;
      }

      const image = productCard.querySelector(".producto-imagen img");
      const name = productCard.querySelector("h3").textContent.trim();
      const category = productCard.querySelector(".producto-categoria").textContent.trim();
      const description = productCard.querySelector(".descripcion-producto").textContent.trim();
      const price = productCard.querySelector(".precio").textContent.trim();

      if (!image || !name || !category || !description || !price) {
        throw new Error(`La ficha de ${productId} tiene datos incompletos.`);
      }

      document.getElementById("detalle-imagen").src = image.src;
      document.getElementById("detalle-imagen").alt = image.alt;
      document.getElementById("detalle-nombre").textContent = name;
      document.getElementById("detalle-categoria").textContent = category;
      document.getElementById("detalle-descripcion").textContent = description;
      document.getElementById("detalle-precio").textContent = price;
      quantityInput.value = "1";
      updateQuantityControls();
      addButton.dataset.productId = productId;
      addButton.textContent = "Añadir al carrito";
      addButton.classList.remove("producto-anadido");
      backLink.href = "index.html";
      backLink.textContent = "← Volver al inicio";
      status.textContent = "";
      renderRelatedProducts(productId, productCard.dataset.categoryId);

      detailSection.hidden = false;
      document.body.classList.add("producto-detalle-activo");
      document.title = `${name} | Apex Sports`;
      detailSection.scrollIntoView({ block: "start" });
      detailSection.focus({ preventScroll: true });
    }

    window.addEventListener("hashchange", renderDetails);
    decreaseQuantity.addEventListener("click", () => adjustQuantity(-1));
    increaseQuantity.addEventListener("click", () => adjustQuantity(1));
    quantityInput.addEventListener("input", updateQuantityControls);
    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest("#detalle-agregar")) {
        window.setTimeout(() => {
          status.textContent = document.getElementById("cart-status").textContent;
        }, 0);
      }
    });
    renderDetails();
  }

  if (document.documentElement.dataset.catalogReady === "true") initializeProductDetails();
  else document.addEventListener("catalog:ready", initializeProductDetails, { once: true });
})();
