(() => {
  const form = document.getElementById("pago-formulario");
  if (!form) return;

  const radios = [...form.querySelectorAll('input[name="metodo"]')];
  const cardFields = [
    { input: document.getElementById("titular"), error: document.getElementById("titular-error") },
    { input: document.getElementById("numero"), error: document.getElementById("numero-error") },
    { input: document.getElementById("vencimiento"), error: document.getElementById("vencimiento-error") },
    { input: document.getElementById("seguridad"), error: document.getElementById("seguridad-error") }
  ];
  const cardPanel = document.getElementById("panel-tarjeta");
  const transferPanel = document.getElementById("panel-transferencia");
  const localPanel = document.getElementById("panel-local");
  const shippingRow = document.querySelector("[data-pago-envio]");
  const total = document.querySelector("[data-pago-total]");
  const confirmButton = form.querySelector('button[type="submit"]');
  const generalError = document.getElementById("pago-error-general");
  const moneyPattern = /^\$(\d+),(\d{2})$/;
  const cartStorageKey = "apex-sports-cart";
  const orderStorageKey = "apex-sports-last-order";
  const requestedDelivery = new URLSearchParams(window.location.search).get("entrega");
  const deliveryChoice = requestedDelivery === null || requestedDelivery === "estandar" || requestedDelivery === "express"
    ? requestedDelivery || "estandar"
    : null;
  const deliveryOptions = {
    estandar: { label: "Envío estándar", cost: 400 },
    express: { label: "Envío express", cost: 800 }
  };

  function readSubtotalCents() {
    const subtotalText = document.querySelector("[data-cart-subtotal]").textContent.trim();
    const match = subtotalText.match(moneyPattern);
    if (!match) throw new Error("No se pudo leer el subtotal para calcular el pedido.");
    return Number(match[1]) * 100 + Number(match[2]);
  }

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  function saveOrderAndClearCart(method) {
    const rawCart = localStorage.getItem(cartStorageKey);
    const items = rawCart ? JSON.parse(rawCart) : [];
    if (!Array.isArray(items) || items.length === 0 || !items.every((item) =>
      item && typeof item.id === "string"
      && typeof item.name === "string"
      && typeof item.category === "string"
      && Number.isSafeInteger(item.price)
      && Number.isSafeInteger(item.quantity)
      && item.price >= 0
      && item.quantity > 0
    )) {
      throw new Error("El carrito está vacío o contiene datos inválidos.");
    }

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingCost = method === "local" ? 0 : deliveryOptions[deliveryChoice].cost;
    const order = {
      id: `CN-${Date.now()}`,
      method,
      delivery: method === "local" ? "local" : deliveryChoice,
      items,
      subtotal,
      shipping: shippingCost,
      total: subtotal + shippingCost,
      createdAt: new Date().toISOString()
    };

    sessionStorage.setItem(orderStorageKey, JSON.stringify(order));
    localStorage.removeItem(cartStorageKey);
  }

  function restrictNumericInput(input) {
    const digits = input.value.replace(/\D/g, "").slice(0, input.id === "numero" ? 16 : input.id === "seguridad" ? 3 : 4);
    input.value = input.id === "vencimiento" && digits.length > 2
      ? `${digits.slice(0, 2)}/${digits.slice(2)}`
      : digits;
  }

  function validateCardField(field) {
    const value = field.input.value.trim();
    const id = field.input.id;
    let message = "";

    if (id === "titular" && !/^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,}$/u.test(value)) {
      message = "Escribe el nombre del titular con al menos 2 letras.";
    } else if (id === "numero") {
      if (!/^\d{16}$/.test(value)) {
        message = "Ingresa exactamente 16 dígitos.";
      }
    } else if (id === "vencimiento") {
      const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2}|\d{4})$/);
      if (!match) {
        message = "Ingresa una fecha de vencimiento válida en formato MM/AA.";
      } else {
        const month = Number(match[1]);
        const yearValue = Number(match[2]);
        const year = match[2].length === 2 ? 2000 + yearValue : yearValue;
        const now = new Date();
        if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) {
          message = "La tarjeta está vencida. Revisa la fecha e inténtalo de nuevo.";
        }
      }
    } else if (id === "seguridad" && !/^\d{3}$/.test(value)) {
      message = "Ingresa exactamente 3 dígitos.";
    }

    field.input.setAttribute("aria-invalid", String(Boolean(message)));
    field.error.textContent = message;
    field.error.hidden = !message;
    return !message;
  }

  function updateSelectedMethod() {
    const selected = radios.find((radio) => radio.checked);
    const isCard = selected?.value === "tarjeta";
    const isTransfer = selected?.value === "transferencia";
    const isLocal = selected?.value === "local";

    generalError.hidden = true;
    generalError.textContent = "";
    cardPanel.hidden = !isCard;
    transferPanel.hidden = !isTransfer;
    localPanel.hidden = !isLocal;
    cardFields.forEach(({ input }) => {
      input.disabled = !isCard;
      input.required = isCard;
      if (!isCard) {
        input.removeAttribute("aria-invalid");
        const error = document.getElementById(`${input.id}-error`);
        error.textContent = "";
        error.hidden = true;
      }
    });

    const subtotal = readSubtotalCents();
    if (isLocal) {
      confirmButton.disabled = false;
      shippingRow.querySelector("span").textContent = "Entrega";
      shippingRow.querySelector("strong").textContent = "$0,00 · Retiro en local";
      total.textContent = formatMoney(subtotal);
    } else {
      if (!deliveryChoice) {
        confirmButton.disabled = true;
        generalError.textContent = "No se pudo identificar el tipo de envío. Vuelve al paso de entrega y selecciónalo de nuevo.";
        generalError.hidden = false;
        shippingRow.querySelector("span").textContent = "Envío";
        shippingRow.querySelector("strong").textContent = "No disponible";
        total.textContent = "No disponible";
        return;
      }
      confirmButton.disabled = false;
      const delivery = deliveryOptions[deliveryChoice];
      shippingRow.querySelector("span").textContent = delivery.label;
      shippingRow.querySelector("strong").textContent = formatMoney(delivery.cost);
      total.textContent = formatMoney(subtotal + delivery.cost);
    }
  }

  radios.forEach((radio) => radio.addEventListener("change", updateSelectedMethod));
  cardFields.forEach((field) => {
    field.input.addEventListener("blur", () => {
      if (field.input.value.trim()) validateCardField(field);
    });
    field.input.addEventListener("input", () => {
      if (["numero", "vencimiento", "seguridad"].includes(field.input.id)) {
        restrictNumericInput(field.input);
      }
      if (field.input.hasAttribute("aria-invalid")) validateCardField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    generalError.hidden = true;
    const selected = radios.find((radio) => radio.checked);
    if (!selected) {
      generalError.textContent = "Selecciona un método de pago para continuar.";
      generalError.hidden = false;
      radios[0].focus();
      return;
    }

    if (selected.value === "tarjeta") {
      const invalidFields = cardFields.filter((field) => !validateCardField(field));
      if (invalidFields.length) {
        generalError.textContent = "Revisa los datos de la tarjeta e inténtalo de nuevo.";
        generalError.hidden = false;
        invalidFields[0].input.focus();
        return;
      }
    }

    if (selected.value !== "local" && !deliveryChoice) {
      generalError.textContent = "No se pudo identificar el tipo de envío. Vuelve al paso de entrega y selecciónalo de nuevo.";
      generalError.hidden = false;
      return;
    }

    try {
      saveOrderAndClearCart(selected.value);
      window.location.assign("pedido-confirmado.html");
    } catch (error) {
      generalError.textContent = `No se pudo finalizar el pedido. ${error.message}`;
      generalError.hidden = false;
    }
  });

  updateSelectedMethod();
})();
