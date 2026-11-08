(() => {
  const form = document.getElementById("pago-formulario");
  if (!form) return;
  const submit = form.querySelector('button[type="submit"]');
  const errorBox = document.getElementById("pago-error-general");
  const shippingLabel = document.querySelector("[data-pago-envio]");
  const shippingCost = document.querySelector("[data-pago-costo]");
  const total = document.querySelector("[data-pago-total]");
  const orderKey = "apex-sports-last-order";
  const idempotencyKey = "apex-checkout-idempotency-v1";

  function readDelivery() {
    let delivery;
    try {
      delivery = JSON.parse(sessionStorage.getItem("apex-checkout-delivery-v1") || "null");
    } catch {
      delivery = null;
    }
    if (!delivery || !["estandar", "express"].includes(delivery.method)) {
      errorBox.textContent = "No encontramos los datos de entrega. Vuelve al paso anterior.";
      errorBox.hidden = false;
      return null;
    }
    return delivery;
  }

  function updateSummary() {
    const delivery = readDelivery();
    const method = form.querySelector('input[name="metodo"]:checked')?.value;
    for (const name of ["tarjeta", "transferencia", "retiro"]) {
      document.getElementById(`panel-${name}`).hidden = method !== name;
    }
    if (!delivery) {
      shippingLabel.textContent = "Envío";
      shippingCost.textContent = "No disponible";
      total.textContent = "No disponible";
      return;
    }
    const fee = method === "retiro" ? 0 : delivery.method === "express" ? 600 : 200;
    const subtotal = document.querySelector("[data-cart-subtotal]").textContent.match(/^\$(\d+),(\d{2})$/);
    shippingLabel.textContent = method === "retiro" ? "Retiro en tienda"
      : delivery.method === "express" ? "Envío express" : "Envío estándar";
    shippingCost.textContent = `$${(fee / 100).toFixed(2).replace(".", ",")}`;
    total.textContent = subtotal
      ? `$${((Number(subtotal[1]) * 100 + Number(subtotal[2]) + fee) / 100).toFixed(2).replace(".", ",")}`
      : "No disponible";
  }

  form.querySelectorAll('input[name="metodo"]').forEach((input) => input.addEventListener("change", updateSummary));
  document.addEventListener("apex:cart-rendered", updateSummary);
  updateSummary();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    const delivery = readDelivery();
    if (!delivery) return;
    const method = form.querySelector('input[name="metodo"]:checked')?.value;
    if (!["tarjeta", "transferencia", "retiro"].includes(method)) {
      errorBox.textContent = "Selecciona un método de pago.";
      errorBox.hidden = false;
      return;
    }
    if (!window.ApexApi?.getToken()) {
      errorBox.textContent = "Tu sesión no está activa. Inicia sesión y vuelve a intentar.";
      errorBox.hidden = false;
      return;
    }

    submit.disabled = true;
    try {
      let key = sessionStorage.getItem(idempotencyKey);
      if (!key) {
        key = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStorage.setItem(idempotencyKey, key);
      }
      const order = await window.ApexApi.request("/checkout", {
        method: "POST",
        headers: { "Idempotency-Key": key },
        body: JSON.stringify({
          delivery_address: delivery.address,
          delivery_city: delivery.city,
          delivery_phone: delivery.phone,
          delivery_reference: delivery.reference || null,
          delivery_method: delivery.method,
          payment_method: "demo",
          simulated_method: method
        })
      });
      sessionStorage.setItem(orderKey, JSON.stringify(order));
      sessionStorage.removeItem("apex-checkout-delivery-v1");
      sessionStorage.removeItem(idempotencyKey);
      localStorage.removeItem("apex-sports-cart");
      window.location.assign("pedido-confirmado.html");
    } catch (error) {
      errorBox.textContent = `No se pudo registrar el pedido. ${error.message}`;
      errorBox.hidden = false;
    } finally {
      submit.disabled = false;
    }
  });
})();
