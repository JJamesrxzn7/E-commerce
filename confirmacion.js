(() => {
  const productSummary = document.getElementById("confirmacion-productos");
  const paymentSummary = document.getElementById("confirmacion-metodo");
  const shippingSummary = document.getElementById("confirmacion-envio");
  const totalSummary = document.getElementById("confirmacion-total");
  const instructions = document.getElementById("confirmacion-instrucciones");
  const methods = {
    tarjeta: "Tarjeta de prueba (sin cobro)",
    transferencia: "Transferencia de demostración",
    local: "Pago simulado y retiro en local"
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
    paymentSummary.textContent = methods[method] || "Método de demostración no identificado";

    if (method === "local") {
      shippingSummary.textContent = "$0,00 · Retiro en local";
      totalSummary.textContent = formatMoney(subtotal);
      instructions.textContent = "Retiro: en una tienda real, espera la confirmación de disponibilidad. La dirección mostrada durante el pago es ficticia; este prototipo no corresponde a un local real.";
    } else {
      shippingSummary.textContent = "Estimado: $4,00–$8,00";
      totalSummary.textContent = `${formatMoney(subtotal + 400)}–${formatMoney(subtotal + 800)}`;
      instructions.textContent = method === "transferencia"
        ? "No realices transferencias. Los datos bancarios vistos en la pantalla anterior son ficticios y solo ilustran el diseño."
        : "El plazo y el envío son referenciales. No ingresaste ni se guardó información de tarjeta.";
    }
  } catch (error) {
    instructions.textContent = `No se pudo cargar el resumen del pedido: ${error.message}`;
    console.error("Error al mostrar el resumen de confirmación.", error);
  }
})();
