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
  const generalError = document.getElementById("pago-error-general");
  const moneyPattern = /^\$(\d+),(\d{2})$/;

  function readSubtotalCents() {
    const subtotalText = document.querySelector("[data-cart-subtotal]").textContent.trim();
    const match = subtotalText.match(moneyPattern);
    if (!match) throw new Error("No se pudo leer el subtotal para calcular el pedido.");
    return Number(match[1]) * 100 + Number(match[2]);
  }

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  function luhnIsValid(digits) {
    let sum = 0;
    let doubleDigit = false;
    for (let index = digits.length - 1; index >= 0; index -= 1) {
      let digit = Number(digits[index]);
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
  }

  function validateCardField(field) {
    const value = field.input.value.trim();
    const id = field.input.id;
    let message = "";

    if (id === "titular" && !/^[\p{L}\p{M}][\p{L}\p{M} .'-]{1,}$/u.test(value)) {
      message = "Escribe el nombre del titular con al menos 2 letras.";
    } else if (id === "numero") {
      const digits = value.replace(/[ -]/g, "");
      if (!/^\d{13,19}$/.test(digits) || !luhnIsValid(digits)) {
        message = "Revisa el número de tarjeta e inténtalo de nuevo.";
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
    } else if (id === "seguridad" && !/^\d{3,4}$/.test(value)) {
      message = "Ingresa un código de seguridad de 3 o 4 dígitos.";
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
      shippingRow.querySelector("strong").textContent = "$0,00 · Retiro en local";
      total.textContent = formatMoney(subtotal);
    } else {
      shippingRow.querySelector("strong").textContent = "$4,00–$8,00";
      total.textContent = `${formatMoney(subtotal + 400)}–${formatMoney(subtotal + 800)}`;
    }
  }

  radios.forEach((radio) => radio.addEventListener("change", updateSelectedMethod));
  cardFields.forEach((field) => {
    field.input.addEventListener("blur", () => {
      if (field.input.value.trim()) validateCardField(field);
    });
    field.input.addEventListener("input", () => {
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

    window.location.assign(`pedido-confirmado.html?metodo=${encodeURIComponent(selected.value)}`);
  });

  updateSelectedMethod();
})();
