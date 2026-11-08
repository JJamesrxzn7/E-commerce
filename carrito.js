(() => {
  const storageKey = "apex-sports-cart";
  const cartOriginKey = "apex-sports-cart-origin-v1";
  const syncPlanKey = "apex-sports-cart-sync-v1";
  const cartCount = document.querySelector(".enlace-carrito .contador");
  const cartLink = document.querySelector(".enlace-carrito");
  const cartItems = document.getElementById("cart-items");
  const itemCount = document.getElementById("cart-count");
  const checkoutLink = document.getElementById("checkout-link");
  const cartStatus = document.getElementById("cart-status");
  let guestSyncPromise = null;

  function readCart() {
    const rawCart = localStorage.getItem(storageKey);
    if (!rawCart) return [];

    const cart = JSON.parse(rawCart);
    if (!Array.isArray(cart) || !cart.every((item) =>
      item && typeof item.id === "string"
      && typeof item.name === "string"
      && typeof item.category === "string"
      && Number.isSafeInteger(item.price)
      && Number.isSafeInteger(item.quantity)
      && item.price >= 0
      && item.quantity > 0
    )) {
      throw new Error("El contenido guardado del carrito no es válido.");
    }
    return cart;
  }

  function writeCart(cart, fromServer = false) {
    localStorage.setItem(storageKey, JSON.stringify(cart));
    if (fromServer) localStorage.setItem(cartOriginKey, "server");
    else if (!window.ApexApi?.getToken()) localStorage.setItem(cartOriginKey, "guest");
  }

  async function loadRemoteCart() {
    if (!window.ApexApi?.getToken()) return;
    const data = await window.ApexApi.request("/cart");
    const cart = data.items.map((item) => ({
      id: item.id,
      name: item.name,
      category: "",
      price: item.priceCents,
      quantity: item.quantity,
      imageUrl: item.imageUrl
    }));
    writeCart(cart, true);
    renderCart();
  }

  async function setRemoteQuantity(productId, quantity) {
    await window.ApexApi.request("/cart/items", {
      method: "PUT",
      body: JSON.stringify({ product_id: productId, quantity })
    });
    await loadRemoteCart();
  }

  async function loadAllProducts() {
    const products = [];
    let total = null;
    while (total === null || products.length < total) {
      const data = await window.ApexApi.request(`/products?limit=100&offset=${products.length}`);
      if (!data || !Array.isArray(data.items) || !Number.isSafeInteger(data.total) || data.total < 0) {
        throw new Error("La API devolvió un catálogo inválido.");
      }
      if (total !== null && total !== data.total) {
        throw new Error("El catálogo cambió mientras se sincronizaba el carrito.");
      }
      total = data.total;
      if (data.items.length === 0 && products.length < total) {
        throw new Error("No se pudo cargar el catálogo completo para sincronizar el carrito.");
      }
      products.push(...data.items);
    }
    return products;
  }

  async function syncGuestCart() {
    if (!window.ApexApi?.getToken()) return;
    const user = window.ApexApi.getUser();
    if (!user || typeof user.id !== "string") {
      throw new Error("No se pudo identificar la cuenta para sincronizar el carrito.");
    }
    const guest = readCart();
    if (!guest.length) {
      await loadRemoteCart();
      return;
    }
    let plan;
    const savedPlan = localStorage.getItem(syncPlanKey);
    if (savedPlan) {
      try {
        plan = JSON.parse(savedPlan);
      } catch {
        throw new Error("El estado de sincronización del carrito no es válido.");
      }
      if (!plan || plan.userId !== user.id) {
        throw new Error("Hay una sincronización pendiente de otra cuenta. Inicia sesión con esa cuenta para terminarla.");
      }
      if (!Array.isArray(plan.items) || !plan.items.every((item) =>
        item && typeof item.productId === "string"
        && Number.isSafeInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 99
      )) {
        throw new Error("El estado de sincronización del carrito no es válido.");
      }
    } else {
      const [catalog, current] = await Promise.all([
        loadAllProducts(),
        window.ApexApi.request("/cart")
      ]);
      const quantities = new Map(current.items.map((item) => [item.id, item.quantity]));
      const items = guest.map((localItem) => {
        const product = catalog.find((item) => item.id === localItem.id)
          || catalog.find((item) => item.name.toLocaleLowerCase() === localItem.name.toLocaleLowerCase());
        if (!product) throw new Error(`No encontramos "${localItem.name}" en el catálogo actual.`);
        const quantity = (quantities.get(product.id) || 0) + localItem.quantity;
        if (quantity > 99) throw new Error(`La cantidad de "${localItem.name}" supera el límite de 99.`);
        quantities.set(product.id, quantity);
        return { productId: product.id, quantity };
      });
      plan = { userId: user.id, items };
      localStorage.setItem(syncPlanKey, JSON.stringify(plan));
    }

    for (const item of plan.items) {
      await window.ApexApi.request("/cart/items", {
        method: "PUT",
        body: JSON.stringify({ product_id: item.productId, quantity: item.quantity })
      });
    }
    localStorage.removeItem(storageKey);
    localStorage.removeItem(syncPlanKey);
    await loadRemoteCart();
  }

  function hasGuestCart() {
    const origin = localStorage.getItem(cartOriginKey);
    return Boolean(localStorage.getItem(syncPlanKey))
      || origin === "guest"
      || (!origin && readCart().length > 0);
  }

  async function ensureRemoteCart() {
    if (!window.ApexApi?.getToken() || !hasGuestCart()) return;
    if (!guestSyncPromise) {
      guestSyncPromise = syncGuestCart().finally(() => {
        guestSyncPromise = null;
      });
    }
    await guestSyncPromise;
  }

  async function syncOrLoadCart() {
    if (!window.ApexApi?.getToken()) return;
    if (hasGuestCart()) {
      await ensureRemoteCart();
    } else {
      await loadRemoteCart();
    }
  }

  function money(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  function totalItems(cart) {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  function announce(message) {
    if (cartStatus) cartStatus.textContent = message;
  }

  function renderCart() {
    const cart = readCart();
    const count = totalItems(cart);
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

    if (cartCount) cartCount.textContent = String(count);
    if (cartLink) cartLink.setAttribute("aria-label", `Ver carrito, ${count} ${count === 1 ? "artículo" : "artículos"}`);
    if (itemCount) itemCount.textContent = `(${count})`;
    if (checkoutLink) {
      checkoutLink.setAttribute("aria-disabled", String(count === 0));
      checkoutLink.classList.toggle("boton-deshabilitado", count === 0);
    }

    document.querySelectorAll("[data-cart-subtotal]").forEach((element) => {
      element.textContent = money(subtotal);
    });
    document.dispatchEvent(new CustomEvent("apex:cart-rendered", { detail: { subtotal } }));
    document.querySelectorAll("[data-cart-total-range]").forEach((element) => {
      element.textContent = `${money(subtotal + 400)}–${money(subtotal + 800)}`;
    });
    document.querySelectorAll("[data-cart-items]").forEach((element) => {
      element.replaceChildren();
      cart.forEach((item) => {
        const line = document.createElement("p");
        const label = document.createElement("span");
        const price = document.createElement("strong");
        label.textContent = `${item.name} × ${item.quantity}`;
        price.textContent = money(item.price * item.quantity);
        line.append(label, price);
        element.append(line);
      });
    });

    if (cartItems) {
      cartItems.replaceChildren();
      cart.forEach((item) => {
        const line = document.createElement("article");
        line.className = "linea-carrito";

        const thumbnail = document.createElement("div");
        thumbnail.className = "miniatura imagen-balon";
        thumbnail.setAttribute("aria-hidden", "true");
        thumbnail.textContent = "●";

        const details = document.createElement("div");
        details.className = "detalle-carrito";
        const category = document.createElement("p");
        category.className = "producto-categoria";
        category.textContent = item.category;
        const name = document.createElement("h3");
        name.textContent = item.name;
        const quantity = document.createElement("p");
        quantity.textContent = `Cantidad: ${item.quantity}`;
        details.append(category, name, quantity);

        const quantityControls = document.createElement("div");
        quantityControls.className = "controles-cantidad";
        const decrease = document.createElement("button");
        decrease.type = "button";
        decrease.className = "boton-cantidad";
        decrease.dataset.decreaseItem = item.id;
        decrease.textContent = "−";
        decrease.disabled = item.quantity === 1;
        decrease.setAttribute("aria-label", `Reducir cantidad de ${item.name}`);
        const quantityValue = document.createElement("span");
        quantityValue.textContent = String(item.quantity);
        quantityValue.setAttribute("aria-label", `Cantidad: ${item.quantity}`);
        const increase = document.createElement("button");
        increase.type = "button";
        increase.className = "boton-cantidad";
        increase.dataset.increaseItem = item.id;
        increase.textContent = "+";
        increase.disabled = item.quantity >= 99;
        increase.setAttribute("aria-label", `Aumentar cantidad de ${item.name}`);
        quantityControls.append(decrease, quantityValue, increase);

        const price = document.createElement("strong");
        price.className = "precio";
        price.textContent = money(item.price * item.quantity);
        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "boton-quitar";
        remove.dataset.removeItem = item.id;
        remove.textContent = "Quitar";
        remove.setAttribute("aria-label", `Quitar ${item.name} del carrito`);

        line.append(thumbnail, details, quantityControls, price, remove);
        cartItems.append(line);
      });

      const empty = document.getElementById("cart-empty");
      if (empty) empty.hidden = cart.length > 0;
      if (checkoutLink) checkoutLink.setAttribute("aria-disabled", String(cart.length === 0));
    }
  }

  async function addProduct(link) {
    const card = link.closest(".producto, #detalle-producto, #product-detail");
    const name = card && card.querySelector("#detalle-nombre, #product-name, h3");
    const category = card && card.querySelector("#product-category, .producto-categoria");
    const priceText = card && card.querySelector("#product-price, .precio");
    if (!name || !category || !priceText) {
      throw new Error("No se pudieron leer los datos del producto seleccionado.");
    }

    const match = priceText.textContent.match(/(\d+)[,.](\d{2})/);
    if (!match) throw new Error(`El precio de "${name.textContent.trim()}" no tiene un formato válido.`);
    const price = Number(match[1]) * 100 + Number(match[2]);
    const productName = name.textContent.trim();
    const productCategory = category.textContent.trim();
    const id = card.dataset.catalogProductId || card.dataset.productId;
    if (!id) throw new Error("No se pudo identificar el producto en el catálogo de la API.");
    const quantityInput = card.querySelector("#detalle-cantidad, #product-quantity");
    const quantity = quantityInput ? Number(quantityInput.value) : 1;
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 99) {
      throw new Error("Selecciona una cantidad entera entre 1 y 99.");
    }
    const cart = readCart();
    const existing = cart.find((item) => item.id === id);

    if (window.ApexApi?.getToken()) {
      await ensureRemoteCart();
      const remote = await window.ApexApi.request("/cart");
      const existingRemote = remote.items.find((item) => item.id === id);
      return setRemoteQuantity(id, Math.min(99, (existingRemote?.quantity || 0) + quantity))
        .then(() => ({ name: productName, quantity }));
    }
    if (existing) {
      if (!Number.isSafeInteger(existing.quantity + quantity) || existing.quantity + quantity > 99) {
        throw new Error("La cantidad total no puede superar 99 unidades.");
      }
      existing.quantity += quantity;
    } else cart.push({ id, name: productName, category: productCategory, price, quantity });
    writeCart(cart);
    return { name: productName, quantity };
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (
      localStorage.getItem(syncPlanKey)
      && target.closest("[data-add-product], [data-remove-item], [data-decrease-item], [data-increase-item]")
    ) {
      event.preventDefault();
      announce("Termina la sincronización del carrito antes de cambiar sus productos.");
      return;
    }

    const addLink = target.closest("[data-add-product]");
    if (addLink) {
      event.preventDefault();
      try {
        addLink.setAttribute("aria-busy", "true");
        Promise.resolve(addProduct(addLink)).then((product) => {
          renderCart();
          announce(product.quantity === 1
            ? `${product.name} se añadió al carrito.`
            : `Se añadieron ${product.quantity} unidades de ${product.name} al carrito.`);
          const originalHtml = addLink.innerHTML;
          addLink.textContent = "Añadido ✓";
          addLink.classList.add("producto-anadido");
          window.setTimeout(() => {
            addLink.innerHTML = originalHtml;
            addLink.classList.remove("producto-anadido");
            addLink.removeAttribute("aria-busy");
          }, 1600);
        }).catch((error) => {
          addLink.removeAttribute("aria-busy");
          window.alert(`No se pudo añadir el producto al carrito: ${error.message}`);
        });
      } catch (error) {
        window.alert(`No se pudo añadir el producto al carrito: ${error.message}`);
      }
      return;
    }

    const removeButton = target.closest("[data-remove-item]");
    if (removeButton) {
      try {
        const operation = window.ApexApi?.getToken()
          ? (async () => {
            await ensureRemoteCart();
            return window.ApexApi.request(`/cart/items/${encodeURIComponent(removeButton.dataset.removeItem)}`, { method: "DELETE" });
          })()
          : Promise.resolve(writeCart(readCart().filter((item) => item.id !== removeButton.dataset.removeItem)));
        operation.then(() => loadRemoteCart()).then(() => {
          renderCart();
          announce("Producto quitado del carrito.");
        }).catch((error) => announce(`No se pudo actualizar el carrito: ${error.message}`));
      } catch (error) {
        window.alert(`No se pudo actualizar el carrito: ${error.message}`);
      }
      return;
    }

    const quantityButton = target.closest("[data-decrease-item], [data-increase-item]");
    if (quantityButton) {
      const itemId = quantityButton.dataset.decreaseItem || quantityButton.dataset.increaseItem;
      const increase = quantityButton.hasAttribute("data-increase-item");
      try {
        const cart = readCart();
        const item = cart.find((entry) => entry.id === itemId);
        if (!item) throw new Error("El producto ya no está en el carrito.");
        const operation = window.ApexApi?.getToken()
          ? (async () => {
            await ensureRemoteCart();
            const remote = await window.ApexApi.request("/cart");
            const remoteItem = remote.items.find((entry) => entry.id === itemId);
            if (!remoteItem) throw new Error("El producto ya no está en el carrito.");
            if (increase && remoteItem.quantity >= 99) {
              throw new Error("No se pueden añadir más de 99 unidades.");
            }
            const newQuantity = increase ? remoteItem.quantity + 1 : Math.max(1, remoteItem.quantity - 1);
            await setRemoteQuantity(itemId, newQuantity);
            return newQuantity;
          })()
          : Promise.resolve().then(() => {
            if (increase && item.quantity >= 99) {
              throw new Error("No se pueden añadir más de 99 unidades.");
            }
            const newQuantity = increase ? item.quantity + 1 : Math.max(1, item.quantity - 1);
            writeCart(cart.map((entry) => entry.id === itemId ? { ...entry, quantity: newQuantity } : entry));
            return newQuantity;
          });
        operation.then((newQuantity) => {
          renderCart();
          announce(`Cantidad de ${item.name}: ${newQuantity}.`);
        }).catch((error) => announce(`No se pudo actualizar la cantidad: ${error.message}`));
      } catch (error) {
        announce(`No se pudo actualizar la cantidad: ${error.message}`);
      }
      return;
    }

    if (target.closest("#checkout-link")) {
      if (checkoutLink?.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        announce("Añade al menos un producto antes de continuar.");
        return;
      }

      event.preventDefault();
      if (window.ApexAuth) {
        window.ApexAuth.requireSession({
          opener: checkoutLink,
          message: "Para continuar con la entrega, inicia sesión o crea una cuenta.",
          onAuthenticated: async () => {
            try {
              await ensureRemoteCart();
              window.location.assign(checkoutLink.href);
            } catch (error) {
              announce(`No se pudo sincronizar el carrito: ${error.message}`);
            }
          }
        });
      } else {
        console.error("No se pudo abrir la autenticación para continuar con la entrega.");
        announce("No se pudo comprobar tu sesión. Recarga la página e inténtalo de nuevo.");
      }
    }
  });

  try {
    renderCart();
    syncOrLoadCart().catch((error) => announce(`No se pudo sincronizar el carrito con la API: ${error.message}`));
  } catch (error) {
    announce(`No se pudo cargar el carrito: ${error.message}`);
  }
})();
