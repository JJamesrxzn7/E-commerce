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
    productSummary.textContent = order.items
      .map((item) => `${item.name} × ${item.quantity}`)
      .join(", ");
    paymentSummary.textContent = order.paymentStatus === "NOT_PROCESSED"
      ? "Demostración: pago no procesado"
      : "Estado de pago pendiente";
    shippingSummary.textContent = `${order.delivery.method === "express" ? "Envío express" : "Envío estándar"} · tarifa no configurada`;
    totalSummary.textContent = formatMoney(order.totalCents);
    label.textContent = "PEDIDO REGISTRADO";
    heading.textContent = "Registramos tu pedido";
    description.textContent = "Aquí tienes el resumen del pedido creado.";
    instructions.textContent = "El pedido quedó pendiente. No se realizó ningún cobro; contacta a Apex Sports para acordar el pago y confirmar el despacho.";
    icon.hidden = false;
    summary.hidden = false;
  } catch (error) {
    console.error("No se pudo leer el resumen del pedido guardado.", error);
    showUnavailableOrder("No se pudo leer el resumen del pedido guardado en esta sesión.");
  }
})();
