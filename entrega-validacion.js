(() => {
  const form = document.querySelector(".checkout form");
  if (!form) return;

  const fields = [...form.querySelectorAll(".campo input")];
  const deliveryOptions = [...form.querySelectorAll('input[name="entrega"]')];
  const shippingLabel = document.querySelector("[data-entrega-label]");
  const shippingCost = document.querySelector("[data-entrega-costo]");
  const orderTotal = document.querySelector("[data-entrega-total]");
  const touched = new Set();
  const phonePattern = /^\+?[\d\s().-]+$/;
  const deliveryPrices = { estandar: 400, express: 800 };

  function updateOrderTotal() {
    const selected = deliveryOptions.find((option) => option.checked);
    const subtotalText = document.querySelector("[data-cart-subtotal]").textContent.trim();
    const subtotalMatch = subtotalText.match(/^\$(\d+),(\d{2})$/);
    if (!selected || !subtotalMatch) {
      shippingLabel.textContent = "Envío";
      shippingCost.textContent = "No disponible";
      orderTotal.textContent = "No disponible";
      return;
    }

    const cents = deliveryPrices[selected.value];
    const subtotal = Number(subtotalMatch[1]) * 100 + Number(subtotalMatch[2]);
    const formatMoney = (value) => `$${(value / 100).toFixed(2).replace(".", ",")}`;
    shippingLabel.textContent = selected.value === "express" ? "Envío express" : "Envío estándar";
    shippingCost.textContent = formatMoney(cents);
    orderTotal.textContent = formatMoney(subtotal + cents);
  }

  function messageFor(field) {
    const value = field.value.trim();
    if (field.id === "referencia") return "";
    if (!value) return "Completa este campo para continuar.";

    switch (field.id) {
      case "nombre":
        return value.length < 2 ? "Escribe tu nombre completo (mínimo 2 caracteres)." : "";
      case "correo":
        return field.validity.typeMismatch ? "Ingresa un correo válido, por ejemplo nombre@dominio.com." : "";
      case "telefono": {
        const digits = value.replace(/\D/g, "");
        return !phonePattern.test(value) || digits.length < 7 || digits.length > 15
          ? "Ingresa un teléfono válido: de 7 a 15 dígitos; puedes usar +, espacios o guiones."
          : "";
      }
      case "direccion":
        return value.length < 5 ? "Escribe tu calle y número (mínimo 5 caracteres)." : "";
      case "ciudad":
        return value.length < 2 ? "Escribe el nombre de tu ciudad (mínimo 2 caracteres)." : "";
      default:
        return "";
    }
  }

  function validateField(field) {
    const error = document.getElementById(`${field.id}-error`);
    const message = messageFor(field);
    field.setAttribute("aria-invalid", String(Boolean(message)));
    error.textContent = message;
    error.hidden = !message;
    return !message;
  }

  fields.forEach((field) => {
    field.addEventListener("blur", () => {
      touched.add(field);
      validateField(field);
    });
    deliveryOptions.forEach((option) => option.addEventListener("change", updateOrderTotal));
    updateOrderTotal();
    field.addEventListener("input", () => {
      if (touched.has(field)) validateField(field);
    });
  });

  form.addEventListener("submit", (event) => {
    const results = fields.map((field) => {
      touched.add(field);
      return { field, valid: validateField(field) };
    });
    const firstInvalid = results.find((result) => !result.valid);
    if (firstInvalid) {
      event.preventDefault();
      firstInvalid.field.focus();
      return;
    }

    const deliverySelected = form.querySelector('input[name="entrega"]:checked');
    const deliveryError = document.getElementById("entrega-error");
    deliveryError.hidden = Boolean(deliverySelected);
    deliveryError.textContent = deliverySelected ? "" : "Selecciona una opción de entrega.";
    if (!deliverySelected) {
      event.preventDefault();
      form.querySelector('input[name="entrega"]').focus();
    }
  });
})();
