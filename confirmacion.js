(() => {
  const productSummary = document.getElementById("confirmacion-productos");
  const paymentSummary = document.getElementById("confirmacion-metodo");
  const shippingSummary = document.getElementById("confirmacion-envio");
  const totalSummary = document.getElementById("confirmacion-total");
  const instructions = document.getElementById("confirmacion-instrucciones");
  const orderId = document.getElementById("confirmacion-numero");
  const heading = document.getElementById("confirmacion-titulo");
  const label = document.getElementById("confirmacion-etiqueta");
  const description = document.getElementById("confirmacion-descripcion");
  const icon = document.getElementById("confirmacion-icono");
  const summary = document.getElementById("confirmacion-resumen");
  const whatsapp = document.getElementById("confirmacion-whatsapp");

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  function showUnavailableOrder(message) {
    instructions.textContent = message;
    productSummary.textContent = "No disponible";
    paymentSummary.textContent = "No disponible";
    shippingSummary.textContent = "No disponible";
    totalSummary.textContent = "No disponible";
    summary.hidden = true;
    icon.hidden = true;
  }

  try {
    const order = JSON.parse(sessionStorage.getItem("apex-sports-last-order") || "null");
    if (!order || typeof order.id !== "string" || !Array.isArray(order.items) || !order.items.length) {
      showUnavailableOrder("No se encontró un pedido reciente asociado a esta sesión.");
      return;
    }

    orderId.textContent = order.id;
    productSummary.replaceChildren();
    order.items.forEach((item) => {
      const line = document.createElement("li");
      const name = document.createElement("span");
      const amount = document.createElement("strong");
      name.textContent = `${item.name} × ${item.quantity}`;
      amount.textContent = formatMoney(item.priceCents * item.quantity);
      line.append(name, amount);
      productSummary.append(line);
    });
    const method = order.simulatedMethod;
    const methodNames = { tarjeta: "Tarjeta", transferencia: "Transferencia", retiro: "Pago al retirar" };
    paymentSummary.textContent = method === "retiro" ? "Pendiente al retirar"
      : methodNames[method] ? `${methodNames[method]} · simulado` : "Pendiente de pago";
    shippingSummary.textContent = method === "retiro" ? "Retiro en tienda · $0,00"
      : `${order.delivery.method === "express" ? "Envío express" : "Envío estándar"} · ${formatMoney(order.deliveryFeeCents)}`;
    totalSummary.textContent = formatMoney(order.totalCents);
    label.textContent = "PEDIDO REGISTRADO";
    heading.textContent = method && method !== "retiro" ? "Pago simulado exitoso" : "Registramos tu pedido";
    description.textContent = "Aquí tienes el resumen del pedido creado.";
    instructions.textContent = method === "transferencia"
      ? "La operación es simulada: no se ha verificado ninguna transferencia. Abre WhatsApp, adjunta el comprobante y envía el mensaje."
      : method === "tarjeta" ? "Pago simulado: no se realizó ningún cobro real."
      : method === "retiro" ? "El pago queda pendiente hasta retirar el pedido."
      : "El pedido quedó pendiente. No se realizó ningún cobro.";
    if (method === "transferencia") {
      const message = `Hola, comparto el comprobante del pedido ${order.id} por ${formatMoney(order.totalCents)}.`;
      whatsapp.href = `https://wa.me/593983067670?text=${encodeURIComponent(message)}`;
      whatsapp.hidden = false;
    }
    icon.hidden = false;
    summary.hidden = false;
  } catch (error) {
    console.error("No se pudo leer el resumen del pedido guardado.", error);
    showUnavailableOrder("No se pudo leer el resumen del pedido guardado en esta sesión.");
  }
})();
