(() => {
  const productSummary = document.getElementById("confirmacion-productos");
  const paymentSummary = document.getElementById("confirmacion-metodo");
  const shippingSummary = document.getElementById("confirmacion-envio");
  const totalSummary = document.getElementById("confirmacion-total");
  const instructions = document.getElementById("confirmacion-instrucciones");
  const orderId = document.getElementById("confirmacion-numero");

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  try {
    const order = JSON.parse(sessionStorage.getItem("apex-sports-last-order") || "null");
    if (!order || typeof order.id !== "string" || !Array.isArray(order.items) || !order.items.length) {
      throw new Error("No se encontró un pedido reciente en esta sesión.");
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
    instructions.textContent = "El pedido quedó pendiente. No se realizó ningún cobro; contacta a Apex Sports para acordar el pago y confirmar el despacho.";
  } catch (error) {
    instructions.textContent = `No se pudo cargar el resumen del pedido. ${error.message}`;
    productSummary.textContent = "No disponible";
    paymentSummary.textContent = "No disponible";
    shippingSummary.textContent = "No disponible";
    totalSummary.textContent = "No disponible";
  }
})();
