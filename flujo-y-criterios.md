# Apex Sports: guía del prototipo

Esta guía documenta el diseño; no forma parte de las pantallas de la tienda.

## Alcance y decisiones

- Prototipo de baja fidelidad responsive, implementado con HTML semántico, CSS y JavaScript local para la lista de favoritos; sin servicios externos.
- Catálogo demostrativo de 120 artículos (10 por cada una de las 12 categorías: fútbol, basketball, tennis, artes marciales, volleyball, ropa deportiva, running, ciclismo, fitness, natación, outdoor y accesorios). La portada mantiene todas las categorías con carruseles horizontales de 10 productos y una tarjeta final «Ver más»; la vista exclusiva muestra hasta 15 productos por página.
- La tienda y sus imágenes usan diseños fluidos: tarjetas que se adaptan al ancho disponible, imágenes con recorte `object-fit: cover` y controles con un mínimo táctil de 44 × 44 px.
- Paleta limitada a cinco colores: azul profundo `#17324D` (dominante), marfil `#F4F1E8` y terracota `#A84328` (secundarios), gris `#667581` y blanco `#FFFFFF` (complementarios).
- La compra recorre cuatro clics principales: añadir producto, continuar desde el carrito, continuar desde entrega y confirmar pedido.
- El pago y la entrega son simulaciones visuales. No hay cobro, transferencia ni persistencia de pedido real. Los formularios HTML validan campos obligatorios y la selección de entrega y pago. Los totales finales muestran ambos costos posibles porque HTML/CSS sin lógica no conservan ni recalculan la selección entre páginas.
- Para completar el recorrido en cuatro acciones principales, el envío estándar y la tarjeta aparecen preseleccionados; se pueden cambiar por envío express o transferencia.
- El recorrido demostrativo parte del balón precargado en el carrito. Los enlaces «Añadir al carrito» llevan al mismo carrito de demostración; el prototipo no mantiene cantidades ni selección entre páginas.
- Cualquier persona puede guardar artículos en favoritos con el control de corazón y compararlos después desde «Favoritos». La lista se conserva en `localStorage` del mismo navegador y dispositivo; no exige cuenta para esta demostración.
- La lista local se puede perder si se borran los datos del navegador, se usa otro navegador/dispositivo o se cambia el origen del sitio. Una cuenta no es necesaria para guardar en el mismo dispositivo; para recuperar/sincronizar la lista entre dispositivos sí se requiere autenticación y un servicio/backend que la almacene. Eso queda fuera de este prototipo.
- La paginación muestra hasta 15 productos por página en cada categoría y en favoritos; no se muestran controles si no hay más de 15 productos. Si se agregan más, anterior/siguiente no cambia de categoría, y al abrir otra sección se vuelve a su primera página.
- Se consideran aplicadas las heurísticas 1–4, 6–8. La 5 (prevención de errores) se cubre solo parcialmente mediante campos requeridos y confirmación explícita. La 9 (recuperación de errores) y la 10 (ayuda y documentación) quedan fuera de alcance según la consigna; no hay reversión de transacción real ni ayuda contextual.

## Paleta de colores: uso y motivo

| Color | Rol | Dónde se usa | Por qué |
|---|---|---|---|
| Azul profundo `#17324D` | Dominante | Encabezados, texto principal, botones, marca, barra principal y hero. | Comunica confianza y energía deportiva; su contraste con blanco y marfil permite leer texto y reconocer acciones. |
| Marfil `#F4F1E8` | Secundario | Fondos de categorías y tarjetas de producto, detalles y botones claros. | Suaviza la página frente al blanco puro y separa bloques sin recargar la interfaz. |
| Terracota `#A84328` | Secundario | Acentos, etiquetas pequeñas, foco de teclado y llamada visual. | Añade energía y ayuda a destacar acentos sin competir con el azul. El tono oscuro mantiene contraste suficiente sobre fondos claros. |
| Gris `#667581` | Complementario | Texto secundario, metadatos, bordes y descripciones breves. | Diferencia información secundaria conservando legibilidad sobre blanco y marfil. |
| Blanco `#FFFFFF` | Complementario | Fondo general, paneles y texto sobre zonas oscuras. | Mantiene claridad, espacio visual y contraste con el color dominante. |

Los valores hexadecimales de la implementación están centralizados al inicio de `estilos.css` como variables CSS. La paleta no asigna información únicamente mediante color; los controles también tienen texto, etiquetas y foco visible.

## Uso con teclado

Sí: la navegación y los controles usan enlaces, botones, campos y radios HTML nativos; el pequeño JavaScript de favoritos no reemplaza esos controles. Se puede recorrer con teclado:

- **Tab** avanza al siguiente enlace o control; **Shift+Tab** retrocede.
- **Enter** activa enlaces y botones. **Espacio** activa botones y controles de selección; las flechas cambian opciones dentro de un grupo de radios.
- Cada corazón de favorito es un botón accesible con un nombre que identifica el producto, estado `aria-pressed` y anuncio del resultado a lectores de pantalla.
- Los carruseles de portada se pueden desplazar horizontalmente con trackpad, gesto táctil, foco y teclado; sus controles anterior/siguiente son botones accesibles.
- El enlace **Saltar al contenido** aparece al recibir foco. El control activo tiene un contorno de foco visible.
- **Esc** no se necesita para cerrar nada en este prototipo; los detalles de pago se abren y cierran con Enter o Espacio.

La búsqueda es solo visual: permite escribir y enviar el término a la URL, pero no filtra productos. Los botones de añadir llevan al carrito fijo de demostración; no mantienen el artículo seleccionado. En cambio, los botones de corazón guardan y quitan productos de la lista de favoritos local. Las tarjetas de categoría usan iconos SVG dibujados para representar el deporte o equipo relacionado. La portada presenta todas las categorías y sus carruseles horizontales; los botones **Explorar categoría** y la tarjeta final **Ver más** llevan a la misma vista exclusiva. Al entrar en una categoría se oculta el resto de la portada; **Volver a categorías** restaura todas las secciones. La vista exclusiva muestra hasta diez artículos por página y **Anterior/Siguiente** aparece solo si se agregan más de diez; la lista de favoritos también se pagina si supera ese tamaño.

## Cómo agregar fotografías reales

1. Crea la carpeta `images/productos/` junto a `index.html`.
2. Añade fotos propias, con licencia adecuada o autorizadas por el vendedor. Para este diseño conviene usar formato WebP o JPEG, imagen cuadrada (por ejemplo 800 × 800 px), fondo despejado y peso optimizado.
3. En cada tarjeta, sustituye el dibujo decorativo por una imagen con texto alternativo. Por ejemplo:

   ```html
   <div class="producto-imagen">
     <img src="images/productos/balon-pro-match.webp"
          srcset="images/productos/balon-pro-match-400.webp 400w,
                 images/productos/balon-pro-match-800.webp 800w"
          sizes="(max-width: 480px) 100vw, (max-width: 760px) 50vw, 360px"
          alt="Balón de fútbol Pro Match, talla 5">
   </div>
   ```

4. Las imágenes de productos ya tienen estilos responsive en `estilos.css`: ocupan el ancho de su tarjeta, mantienen una proporción estable y usan `object-fit: cover`. Para cualquier imagen fuera de las tarjetas puedes aplicar:

   ```css
   .producto-imagen img {
     width: 100%;
     height: 100%;
     object-fit: cover;
     display: block;
   }
   ```

5. Repite el cambio en el producto correspondiente, actualizando el nombre del archivo y el `alt` para describir el artículo; comprueba que cada ruta y el contraste de etiquetas superpuestas sigan correctos.

Las tarjetas actualmente usan ilustraciones de formas CSS, no fotografías descargadas. Así el prototipo funciona sin depender de imágenes externas; las rutas anteriores sirven de ejemplo para incorporar archivos locales.

## Flujo de navegación: diagrama de estados

```mermaid
stateDiagram-v2
    [*] --> InicioCatalogo
    InicioCatalogo --> Favoritos: Guardar producto para comparar después
    Favoritos --> InicioCatalogo: Volver al catálogo
    InicioCatalogo --> ProductoSeleccionado: Explorar / elegir categoría
    ProductoSeleccionado --> Carrito: Añadir al carrito [producto disponible]
    Carrito --> InicioCatalogo: Seguir comprando
    Carrito --> Entrega: Continuar [pedido revisado]
    Entrega --> Carrito: Volver al carrito
    Entrega --> ValidarEntrega: Continuar al pago
    ValidarEntrega --> Entrega: Datos obligatorios incompletos
    ValidarEntrega --> Pago: Datos válidos y entrega seleccionada
    Pago --> Entrega: Revisar datos de entrega
    Pago --> ValidarPago: Confirmar pedido
    ValidarPago --> Pago: No se seleccionó método de pago
    ValidarPago --> Confirmacion: Método seleccionado
    Confirmacion --> InicioCatalogo: Volver a la tienda
```

### Puntos de decisión

1. **Producto:** el usuario elige una categoría/producto o sigue explorando; añadir abre el carrito de demostración.
2. **Carrito:** continuar con la compra o volver al catálogo.
3. **Entrega:** los campos requeridos deben ser válidos y debe seleccionarse envío estándar o express. El navegador informa los campos inválidos.
4. **Pago:** el usuario selecciona tarjeta o transferencia; HTML exige una selección antes de confirmar. Los paneles `<details>` permiten consultar información de cada alternativa.
5. **Confirmación:** se informa el resultado simulado y la ventana estimada de entrega (1–5 días) con el rango de costo correspondiente a las modalidades.

## Secuencia de tareas

### Objetivo: comprar un artículo

1. Explorar el catálogo por deporte o usar búsqueda.
2. Elegir el producto y activar **Añadir al carrito**. Feedback: se abre el carrito de demostración con el producto, cantidad y precio.
3. Revisar subtotal y activar **Continuar con la entrega**.
4. Completar nombre, correo, teléfono, dirección y ciudad; elegir envío estándar (3–5 días) o express (1–2 días). Feedback: validación nativa del navegador si falta un dato.
5. Activar **Continuar al pago**; revisar total y seleccionar tarjeta o transferencia. Se pueden desplegar detalles informativos de cada método.
6. Activar **Confirmar pedido**. Feedback: pantalla de confirmación con número demostrativo, producto, plazo estimado y aviso claro de que no hubo cobro.

### Objetivo: cambiar el método de entrega o pago antes de confirmar

1. Usar el enlace **Volver al carrito** o **Volver a la entrega** desde el paso actual.
2. Cambiar la opción seleccionada.
3. Avanzar nuevamente y confirmar cuando los datos sean correctos.

### Objetivo: guardar productos para decidir después

1. Activar el botón de corazón en uno o más artículos.
2. Revisar el contador actualizado junto a **Favoritos** y abrir esa lista cuando se quiera comparar.
3. Quitar un producto con su botón de corazón o volver al catálogo para seguir explorando.
4. Los favoritos permanecen en el mismo navegador y dispositivo. Para conservarlos al cambiar de dispositivo, hará falta iniciar sesión en una futura versión conectada a un backend.

### Objetivo: explorar una categoría desde la portada

1. Revisar las categorías disponibles y recorrer el carrusel con gesto horizontal o con sus botones de flecha.
2. Ver hasta diez productos destacados y activar la tarjeta **Ver más** al final, o el enlace **Explorar categoría**.
3. La misma sección exclusiva se abre en ambos casos; allí se recorren hasta 15 artículos por página.

### Objetivo: revisar todos los artículos de una categoría

1. Elegir la categoría en el selector para ir a su sección exclusiva.
2. Ver hasta los primeros quince productos en la vista exclusiva.
3. Activar **Siguiente** para ver los productos restantes o **Anterior** para regresar; el estado indica el número de página y los botones se desactivan al llegar a los extremos.

## Respuesta del sistema / feedback

| Interacción | Feedback |
|---|---|
| Enlace de categoría o producto | Desplazamiento a la categoría en el catálogo o apertura del carrito de demostración. |
| Búsqueda | Envío del término como parámetro de URL; la interfaz no implementa resultados dinámicos. |
| Envío con campos incompletos | Validación nativa del navegador, foco en el primer control inválido y mensaje asociado. |
| Selección de entrega | La opción marcada es visible; en el paso de pago se muestra una entrega de demostración con costo y plazo estimados. |
| Selección de pago | La selección de radio indica el método; se despliega información adicional al activar los detalles. |
| Agregar o quitar favorito | El corazón cambia entre seleccionado/no seleccionado, se actualiza el contador y se anuncia el nombre del artículo; en la lista se refleja el cambio. |
| Cambiar página | Se muestran hasta quince productos, cambia el indicador de página y se deshabilita el control que ya no aplica. La paginación solo se muestra cuando hay más de quince productos. |
| Confirmación | Resumen final con identificador de demostración y aclaración de que no se procesó dinero. |

## WCAG 2.2: cuatro principios

- **Perceptible:** jerarquía de encabezados, etiquetas visibles, descripciones de los artículos, navegación nombrada, foco visible y contraste alto. Ningún dato importante depende solo del color. Enlaces de salto al contenido.
- **Operable:** controles nativos utilizables con teclado, foco visible, botones y corazones de al menos 44 × 44 px, navegación por páginas y respeto a `prefers-reduced-motion`.
- **Comprensible:** idioma español declarado, formularios con etiquetas, `autocomplete`, tipos de entrada adecuados, requeridos señalados por validación del navegador, pasos de compra y textos de acción explícitos.
- **Robusto:** HTML5 semántico, landmarks, encabezados y controles nativos con nombres accesibles, sin dependencias externas; compatible con navegadores modernos y tecnologías de asistencia.

## Heurísticas de Nielsen consideradas

1. **Visibilidad del estado del sistema:** pasos del checkout, selección de opciones, resumen y confirmación.
2. **Correspondencia con el mundo real:** vocabulario familiar, categorías deportivas, precios, direcciones y plazos cotidianos.
3. **Control y libertad:** regreso a carrito/entrega y volver a la tienda antes o después de la simulación.
4. **Consistencia y estándares:** navegación, botones, formularios y progreso consistentes; controles HTML convencionales.
5. **Prevención de errores (parcial):** campos obligatorios y una selección requerida para envío/pago; el prototipo no valida inventario, cantidades ni datos bancarios.
6. **Reconocer en vez de recordar:** categorías visibles, progreso actual, resumen por etapa y lista de favoritos guardada en el navegador.
7. **Flexibilidad y eficiencia:** acceso por categoría, favoritos para comparar y camino de checkout corto; no hay atajos personalizados.
8. **Diseño estético y minimalista:** contenido comercial prioritario, pantallas de checkout sin elementos promocionales innecesarios.
9. **Ayudar a reconocer, diagnosticar y recuperarse de errores (no implementada):** sin sistema de pedidos o errores del servidor, no se ofrece recuperación contextual.
10. **Ayuda y documentación (no implementada en la interfaz):** se excluye la ayuda contextual; esta guía es documentación del entregable, no contenido de la tienda.
