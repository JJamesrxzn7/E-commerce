(() => {
  const productSummary = document.getElementById("confirmacion-productos");
  const paymentSummary = document.getElementById("confirmacion-metodo");
  const shippingSummary = document.getElementById("confirmacion-envio");
  const totalSummary = document.getElementById("confirmacion-total");
  const instructions = document.getElementById("confirmacion-instrucciones");
  const orderId = document.getElementById("confirmacion-numero");
  const orderStorageKey = "apex-sports-last-order";
  const methods = {
    tarjeta: "Tarjeta de crédito o débito",
    transferencia: "Transferencia bancaria",
    local: "Pago en local y retiro"
  };
  const deliveryMethods = {
    estandar: "Envío estándar",
    express: "Envío express",
    local: "Retiro en local"
  };

  function formatMoney(cents) {
    return `$${(cents / 100).toFixed(2).replace(".", ",")}`;
  }

  try {
    const rawOrder = sessionStorage.getItem(orderStorageKey);
    if (!rawOrder) throw new Error("No se encontró un pedido reciente en esta sesión.");
    const order = JSON.parse(rawOrder);
    if (!order || typeof order.id !== "string" || !Object.hasOwn(methods, order.method)
      || !Number.isSafeInteger(order.subtotal) || order.subtotal < 0
      || !Object.hasOwn(deliveryMethods, order.delivery)
      || !Number.isSafeInteger(order.shipping) || order.shipping < 0
      || !Number.isSafeInteger(order.total) || order.total < 0
      || !Array.isArray(order.items) || order.items.length === 0 || !order.items.every((item) =>
      item && typeof item.id === "string"
      && typeof item.name === "string"
      && typeof item.category === "string"
      && Number.isSafeInteger(item.price)
      && Number.isSafeInteger(item.quantity)
      && item.price >= 0
      && item.quantity > 0
    )) {
      throw new Error("El resumen guardado del pedido tiene un formato inválido.");
    }

    const calculatedSubtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (calculatedSubtotal !== order.subtotal) {
      throw new Error("El subtotal no coincide con los productos guardados.");
    }
    if (order.shipping !== (order.delivery === "local" ? 0 : order.delivery === "express" ? 800 : 400)
      || order.total !== order.subtotal + order.shipping
      || (order.method === "local") !== (order.delivery === "local")) {
      throw new Error("El envío o total no coincide con la opción elegida.");
    }

    orderId.textContent = order.id;
    productSummary.textContent = order.items
      .map((item) => `${item.name} × ${item.quantity}`)
      .join(", ");
    paymentSummary.textContent = methods[order.method];

    if (order.delivery === "local") {
      shippingSummary.textContent = "$0,00 · Retiro en local";
      instructions.textContent = "Puedes retirar tu pedido en el punto seleccionado. Presenta tu número de pedido e identificación al llegar.";
    } else {
      shippingSummary.textContent = `${deliveryMethods[order.delivery]} · ${formatMoney(order.shipping)}`;
      instructions.textContent = order.method === "transferencia"
        ? "Realiza la transferencia con el número de pedido en el concepto y conserva el comprobante."
        : "El pago fue aprobado. Conserva el número de pedido para consultar el estado de tu compra.";
    }
    totalSummary.textContent = formatMoney(order.total);
  } catch (error) {
    instructions.textContent = `No se pudo cargar el resumen del pedido. ${error.message}`;
    productSummary.textContent = "No disponible";
    paymentSummary.textContent = "No disponible";
    shippingSummary.textContent = "No disponible";
    totalSummary.textContent = "No disponible";
    console.error("Error al mostrar el resumen de confirmación.", error);
  }
})();
