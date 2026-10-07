(() => {
  const productSummary = document.getElementById("confirmacion-productos");
  const paymentSummary = document.getElementById("confirmacion-metodo");
  const shippingSummary = document.getElementById("confirmacion-envio");
  const totalSummary = document.getElementById("confirmacion-total");
  const instructions = document.getElementById("confirmacion-instrucciones");
  const methods = {
    tarjeta: "Tarjeta de crédito o débito",
    transferencia: "Transferencia bancaria",
    local: "Pago en local y retiro"
  };

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  try {
    const method = new URLSearchParams(window.location.search).get("metodo");
    const cart = JSON.parse(localStorage.getItem("apex-sports-cart") || "[]");
    if (!Array.isArray(cart) || !cart.every((item) =>
      item && typeof item.name === "string"
      && Number.isSafeInteger(item.price)
      && Number.isSafeInteger(item.quantity)
      && item.price >= 0
      && item.quantity > 0
    )) {
      throw new Error("Los datos guardados del carrito tienen un formato inválido.");
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    productSummary.textContent = cart.length
      ? cart.map((item) => `${item.name} × ${item.quantity}`).join(", ")
      : "No hay productos guardados en el carrito.";
    paymentSummary.textContent = methods[method] || "No indicado";

    if (method === "local") {
      shippingSummary.textContent = "$0,00 · Retiro en local";
      totalSummary.textContent = formatMoney(subtotal);
      instructions.textContent = "Puedes retirar tu pedido en el punto seleccionado. Presenta tu número de pedido e identificación al llegar.";
    } else {
      shippingSummary.textContent = "Estimado: $4,00–$8,00";
      totalSummary.textContent = `${formatMoney(subtotal + 400)}–${formatMoney(subtotal + 800)}`;
      instructions.textContent = method === "transferencia"
        ? "Realiza la transferencia con el número de pedido en el concepto y conserva el comprobante."
        : "El pago fue aprobado. Conserva el número de pedido para consultar el estado de tu compra.";
    }
  } catch (error) {
    instructions.textContent = `No se pudo cargar el resumen del pedido. ${error.message}`;
    console.error("Error al mostrar el resumen de confirmación.", error);
  }
})();
