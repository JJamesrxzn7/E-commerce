# Auditoría de riesgos — Apex Sports

**Fecha:** 6 de octubre de 2026
**Alcance:** revisión estática del catálogo, carrito, entrega, pago, confirmación y almacenamiento local; comprobación manual en navegador del flujo de añadir productos y consultar el carrito.
**Tipo de revisión:** auditoría funcional y de riesgos para un prototipo de interfaz. No es una prueba de penetración ni una certificación formal de accesibilidad.

## Resumen ejecutivo

El proyecto se identifica correctamente como demostración: no procesa pagos ni envía pedidos. El riesgo más importante aparece si se presenta o reutiliza como una tienda real sin incorporar un backend. Además, el checkout puede mostrar una confirmación con datos fijos que no corresponden al carrito y no actualiza el costo de envío según la opción seleccionada.

| Prioridad | Hallazgos |
|---|---:|
| Alto | 1 |
| Medio | 2 |
| Bajo | 0 |

## Riesgos altos

### A1. El prototipo no puede garantizar ni procesar pedidos reales

- **Impacto:** alto si se publica como tienda operativa; no hay una transacción real en el alcance actual.
- **Evidencia:** el proyecto no cuenta con servidor, base de datos ni procesamiento de pagos ([README.md](./README.md#L20)). El contenido y los precios del carrito se leen del DOM y se guardan en `localStorage` ([carrito.js](./carrito.js#L120)).
- **Riesgo:** cualquier dato guardado en el navegador puede borrarse o modificarse por el usuario. No existe validación de precio, disponibilidad, identidad del pedido ni confirmación de pago en una fuente confiable del servidor.
- **Recomendación:** mantener el aviso de demostración. Antes de habilitar ventas, implementar API/backend, catálogo y precios autoritativos del servidor, validación de inventario, creación de pedidos y proveedor de pagos; no confiar en el total enviado por el navegador.

## Riesgos medios

### M1. Es posible alcanzar una confirmación que no representa el carrito

- **Impacto:** confusión sobre el estado del pedido y el monto.
- **Evidencia:** el bloqueo de carrito vacío se aplica al clic en el enlace del carrito, no a la ruta de entrega o pago ([carrito.js](./carrito.js#L170)). La página de pago navega directamente a confirmación ([pago.html](./pago.html#L19)), y esta presenta un número, producto y total fijos ([pedido-confirmado.html](./pedido-confirmado.html#L21)).
- **Riesgo:** se puede abrir la URL de pago directamente o completar el flujo con productos distintos y ver “Tu pedido está confirmado” con el Balón Pro Match y un total que no coinciden con la selección.
- **Recomendación:** en la demostración, validar carrito no vacío al entrar y antes de confirmar; mostrar en la confirmación el resumen real, o cambiar el texto para indicar claramente que no se creó un pedido. En una tienda real, toda validación y confirmación debe realizarse en el servidor.

### M2. El costo de envío seleccionado no se refleja en el pago

- **Estado:** corregido después de esta auditoría. La entrega y el pago muestran la modalidad elegida, su tarifa exacta y el total; la confirmación conserva ese mismo total.
- **Impacto:** el total estimado puede no coincidir con la opción que la persona eligió.
- **Evidencia original:** entrega ofrece estándar y express ([entrega.html](./entrega.html#L35)); antes de la corrección, el resumen posterior continuaba mostrando un rango aunque lo titulaba “Envío elegido” ([pago.html](./pago.html#L56)).
- **Riesgo:** quien selecciona una opción no ve con claridad cuál quedó aplicada ni el total resultante.
- **Corrección aplicada:** se conserva la opción al pasar al pago, se muestra su costo exacto y se calcula el total; la confirmación registra la tarifa y el monto finales.

## Riesgos bajos

No se identificaron riesgos bajos pendientes en el alcance revisado.

### Hallazgo B1 resuelto: modificación de cantidades

La limitación de cantidad informada en la primera revisión quedó corregida el 6 de octubre de 2026: ahora el carrito incluye controles accesibles para aumentar y disminuir la cantidad y actualiza el subtotal y el contador. El botón para reducir queda deshabilitado en la cantidad mínima de uno; la acción «Quitar» elimina el producto.

## Aspectos revisados favorablemente

- El carrito persiste entre páginas en el navegador y sus importes se recalculan a partir de los artículos guardados.
- El flujo informa que es una simulación y que no procesa pagos ([README.md](./README.md#L20)).
- La revisión manual confirmó que añadir un producto permanece en el catálogo y actualiza el contador.

## Limitaciones de esta auditoría

La revisión no incluye pruebas de carga, análisis automatizado de dependencias, validación formal WCAG ni una evaluación de seguridad sobre un backend, porque el proyecto es estático y no tiene uno. Los riesgos de producción descritos son bloqueos de preparación para operar una tienda real, no evidencia de que el prototipo procese pagos o transmita pedidos.
