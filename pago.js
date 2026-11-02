(() => {
  const form = document.getElementById("pago-formulario");
  if (!form) return;
  const submit = form.querySelector('button[type="submit"]');
  const errorBox = document.getElementById("pago-error-general");
  const orderKey = "apex-sports-last-order";
  const idempotencyKey = "apex-checkout-idempotency-v1";

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBox.hidden = true;
    let delivery;
    try {
      delivery = JSON.parse(sessionStorage.getItem("apex-checkout-delivery-v1") || "null");
    } catch {
      delivery = null;
    }
    if (!delivery || !["estandar", "express"].includes(delivery.method)) {
      errorBox.textContent = "No encontramos los datos de entrega. Vuelve al paso anterior.";
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
          payment_method: "demo"
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
