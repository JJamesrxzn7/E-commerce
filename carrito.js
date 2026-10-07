(() => {
  const storageKey = "apex-sports-cart";
  const cartCount = document.querySelector(".enlace-carrito .contador");
  const cartLink = document.querySelector(".enlace-carrito");
  const cartItems = document.getElementById("cart-items");
  const itemCount = document.getElementById("cart-count");
  const checkoutLink = document.getElementById("checkout-link");
  const cartStatus = document.getElementById("cart-status");

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

  function writeCart(cart) {
    localStorage.setItem(storageKey, JSON.stringify(cart));
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

  function addProduct(link) {
    const card = link.closest(".producto, #detalle-producto");
    const name = card && card.querySelector("#detalle-nombre, h3");
    const category = card && card.querySelector(".producto-categoria");
    const priceText = card && card.querySelector(".precio");
    if (!name || !category || !priceText) {
      throw new Error("No se pudieron leer los datos del producto seleccionado.");
    }

    const match = priceText.textContent.match(/(\d+)[,.](\d{2})/);
    if (!match) throw new Error(`El precio de "${name.textContent.trim()}" no tiene un formato válido.`);
    const price = Number(match[1]) * 100 + Number(match[2]);
    const productName = name.textContent.trim();
    const productCategory = category.textContent.trim();
    const id = `${productCategory}|${productName}`;
    const quantityInput = card.querySelector("#detalle-cantidad");
    const quantity = quantityInput ? Number(quantityInput.value) : 1;
    if (!Number.isSafeInteger(quantity) || quantity < 1) {
      throw new Error("Selecciona una cantidad entera de al menos 1.");
    }
    const cart = readCart();
    const existing = cart.find((item) => item.id === id);

    if (existing) {
      if (!Number.isSafeInteger(existing.quantity + quantity)) {
        throw new Error("La cantidad total supera el límite permitido.");
      }
      existing.quantity += quantity;
    } else cart.push({ id, name: productName, category: productCategory, price, quantity });
    writeCart(cart);
    return { name: productName, quantity };
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const addLink = target.closest("[data-add-product]");
    if (addLink) {
      event.preventDefault();
      try {
        const product = addProduct(addLink);
        renderCart();
        announce(`${product.quantity} ${product.quantity === 1 ? "unidad añadida" : "unidades añadidas"} de ${product.name} al carrito.`);
        addLink.textContent = "Añadido ✓";
        addLink.classList.add("producto-anadido");
        window.setTimeout(() => {
          addLink.textContent = "Añadir al carrito";
          addLink.classList.remove("producto-anadido");
        }, 1600);
      } catch (error) {
        window.alert(`No se pudo añadir el producto al carrito: ${error.message}`);
      }
      return;
    }

    const removeButton = target.closest("[data-remove-item]");
    if (removeButton) {
      try {
        writeCart(readCart().filter((item) => item.id !== removeButton.dataset.removeItem));
        renderCart();
        announce("Producto quitado del carrito.");
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
        if (increase && item.quantity === Number.MAX_SAFE_INTEGER) {
          throw new Error("No se puede aumentar más la cantidad de este producto.");
        }
        if (increase) item.quantity += 1;
        else item.quantity = Math.max(1, item.quantity - 1);
        writeCart(cart);
        renderCart();
        announce(`Cantidad de ${item.name}: ${item.quantity}.`);
      } catch (error) {
        announce(`No se pudo actualizar la cantidad: ${error.message}`);
      }
      return;
    }

    if (target.closest("#checkout-link") && checkoutLink?.getAttribute("aria-disabled") === "true") {
      event.preventDefault();
      announce("Añade al menos un producto antes de continuar.");
    }
  });

  try {
    renderCart();
  } catch (error) {
    announce(`No se pudo cargar el carrito: ${error.message}`);
  }
})();
