# Apex Sports: guía de la tienda

Esta guía documenta el diseño; no forma parte de las pantallas de la tienda.

## Alcance y decisiones

- Interfaz responsive implementada con HTML semántico, CSS y JavaScript, integrada con una API FastAPI para catálogo, autenticación, carrito autenticado y creación de pedidos. Favoritos siguen siendo locales.
- Catálogo demostrativo de 120 artículos (10 por cada una de las 12 categorías: fútbol, basketball, tennis, artes marciales, volleyball, ropa deportiva, running, ciclismo, fitness, natación, outdoor y accesorios). La portada mantiene todas las categorías con carruseles horizontales de 10 productos; la vista de cada deporte y la lista de favoritos muestran todos sus productos sin paginación.
- La tienda y sus imágenes usan diseños fluidos: tarjetas que se adaptan al ancho disponible, imágenes con recorte `object-fit: cover` y controles con un mínimo táctil de 44 × 44 px.
- Paleta limitada a cinco colores: azul profundo `#17324D` (dominante), marfil `#F4F1E8` y terracota `#A84328` (secundarios), gris `#667581` y blanco `#FFFFFF` (complementarios).
- La compra requiere añadir productos, continuar desde el carrito y entrega, y confirmar el pedido pendiente. El checkout crea el pedido en la API, pero no procesa pagos ni autoriza despacho.
- La pantalla de pago confirma sólo pedidos pendientes de pago. No se piden datos de tarjeta ni se realizan transferencias; las antiguas opciones de pago demostrativas permanecen desactivadas. El destino de entrega se envía al checkout y queda asociado al pedido.
- La entrega estándar aparece seleccionada, pero tarifa y plazo no están configurados. La tarifa registrada por la API es cero; la interfaz avisa que no está configurada y no la presenta como tarifa comercial.
- Al seleccionar la imagen o los datos de un artículo se abre una ficha propia con imagen, descripción, precio, selector de cantidad, acción para añadir al carrito y productos relacionados. La cantidad elegida se suma al carrito y puede ajustarse allí; los controles de cantidad son accesibles por teclado y cumplen el mínimo táctil de 44 px.
- Para guardar artículos en favoritos, se solicita una sesión. La lista se conserva actualmente en `localStorage`; el backend aún no tiene endpoints de favoritos conectados.
- Los favoritos locales se pueden perder si se borran los datos del navegador, se usa otro navegador/dispositivo o se cambia el origen del sitio. La sincronización con la tabla `FAVORITOS` queda pendiente.
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

La búsqueda consulta el catálogo que carga la API. Seleccionar la imagen o los datos de un producto abre su ficha, con imagen, descripción, precio, selector de cantidad, acción para añadir al carrito y recomendaciones relacionadas; **Volver al inicio** regresa a la página principal desde cualquier ficha. Los controles de cantidad permiten definir unidades antes de añadirlas y ajustar el valor desde el carrito. Los botones del carrito sincronizan cambios con API para usuarios autenticados; favoritos todavía usan almacenamiento local. Las tarjetas de categoría usan iconos SVG dibujados para representar el deporte o equipo relacionado. La portada presenta todas las categorías y sus carruseles horizontales; el enlace **Explorar categoría** abre la vista de todos los artículos de esa categoría. Al entrar en una categoría se oculta el resto de la portada; **Volver a categorías** restaura todas las secciones. Las categorías y favoritos muestran todos los artículos sin paginación.

## Ilustraciones de los productos

Cada artículo tiene su propia ilustración SVG original: muestra únicamente el producto sobre un fondo liso, sin personas ni escenas. Las 120 ilustraciones se guardan en `images/products/`, usan texto alternativo y tienen licencia CC BY 4.0. Se pueden regenerar ejecutando `node generar-ilustraciones.js` desde la raíz del proyecto. Son ilustraciones referenciales; no son fotografías oficiales de los modelos comerciales ficticios del prototipo.

Para cambiar la ilustración de un artículo, modifica su registro en `data/products.json` y la regla correspondiente del archivo `generar-ilustraciones.js`; luego ejecuta el generador. Las imágenes locales responden y se muestran sin depender de un servicio externo.

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

1. **Producto:** el usuario abre la ficha del producto para revisar su imagen y descripción; puede añadirlo desde esa vista o volver a explorar.
2. **Carrito:** continuar con la compra o volver al catálogo.
3. **Entrega:** el usuario completa teléfono, dirección y ciudad para ese pedido; referencia es opcional. Se debe seleccionar un método y los campos deben ser válidos.
4. **Pago:** la única opción habilitada es confirmar un pedido pendiente; las opciones de tarjeta, transferencia y retiro están deshabilitadas. No se solicitan datos financieros ni se procesa el pago.
5. **Confirmación:** la API registra el pedido como pendiente de pago, con snapshot de entrega. El carrito se limpia después de una respuesta exitosa; el resumen de confirmación se presenta temporalmente desde la sesión del navegador.

## Secuencia de tareas

### Objetivo: comprar un artículo

1. Explorar el catálogo por deporte o usar búsqueda.
2. Abrir un producto y revisar su ficha y recomendaciones; elegir una cantidad con el campo o los botones −/+, y activar **Añadir al carrito**. Feedback: el contador y el mensaje de estado confirman las unidades añadidas sin salir de la ficha.
3. Revisar subtotal y activar **Continuar con la entrega**. Si no hay sesión, se solicita iniciar sesión o crear una cuenta; al completar el acceso se abre Entrega. Si se cierra el diálogo, se permanece en el carrito.
4. Completar teléfono, dirección y ciudad para este pedido; la referencia es opcional. Estos datos no actualizan el perfil. Feedback: validación en español y aviso de que la tarifa está sin configurar.
5. Activar **Continuar al pago**. La única opción operativa es confirmar un pedido pendiente; no se solicitan datos financieros.
6. Activar **Confirmar pedido**. Feedback: la API crea una orden pendiente de pago; no hay cobro ni despacho. El resumen se muestra en la confirmación.

### Objetivo: cambiar el método de entrega o pago antes de confirmar

1. Usar el enlace **Volver al carrito** o **Volver a la entrega** desde el paso actual.
2. Cambiar la opción seleccionada.
3. Avanzar nuevamente y confirmar cuando los datos sean correctos.

### Objetivo: guardar productos para decidir después

1. Activar el botón de corazón o abrir **Favoritos**. Si no hay sesión, se solicita iniciar sesión o crear una cuenta.
2. Al completar el acceso se guarda o muestra la lista local; revisar el contador y abrir Favoritos cuando se quiera comparar. La lista aún no se sincroniza con la API.
3. Quitar un producto con su botón de corazón o volver al catálogo para seguir explorando.
4. La lista permanece en este navegador y dispositivo hasta que se implementen endpoints de favoritos.

### Objetivo: explorar una categoría desde la portada

1. Revisar las categorías disponibles y recorrer el carrusel con gesto horizontal o con sus botones de flecha.
2. Recorrer los productos destacados con el carrusel o activar el enlace **Explorar categoría**.
3. La vista exclusiva muestra todos los productos de la categoría, sin paginación.

## Respuesta del sistema / feedback

| Interacción | Feedback |
|---|---|
| Enlace de categoría o producto | Desplazamiento a la categoría o apertura de la ficha del producto con recomendaciones relacionadas. |
| Búsqueda | Envío del término como parámetro de URL; la interfaz no implementa resultados dinámicos. |
| Envío con campos incompletos | Validación personalizada en español, foco en el primer control inválido y mensaje asociado. |
| Selección de entrega | La opción marcada es visible; tarifa y total aparecen como no configurados hasta acordar reglas comerciales. El snapshot se conserva en la orden. |
| Selección de pago | La única opción habilitada es confirmar un pedido pendiente; no se solicitan tarjetas ni se procesan transferencias o pagos en local. |
| Añadir al carrito desde la ficha | El contador del carrito se actualiza y el botón confirma la acción; permanece visible la ficha del producto. |
| Seleccionar cantidad en la ficha | Los controles −/+ y el campo numérico actualizan la cantidad; el carrito recibe las unidades seleccionadas. |
| Abrir Favoritos o activar un corazón sin sesión | Se muestra el diálogo con las opciones de iniciar sesión y crear cuenta. Al autenticar se completa la navegación o el cambio de favorito; cerrar el diálogo cancela la acción. |
| Agregar o quitar favorito con sesión | El corazón cambia entre seleccionado/no seleccionado, se actualiza el contador y se anuncia el nombre del artículo; en la lista se refleja el cambio. |
| Continuar con la entrega sin sesión | Se muestra el diálogo de acceso; al autenticar se abre Entrega y al cerrar el diálogo se permanece en el carrito. |
| Recomendaciones | La ficha presenta hasta seis productos relacionados; seleccionar uno abre su propia ficha. |
| Confirmación | Resumen de la respuesta del servidor; el pedido queda pendiente de pago, el carrito se limpia tras éxito y la copia del resumen permanece en la sesión actual. |

## WCAG 2.2: cuatro principios

- **Perceptible:** jerarquía de encabezados, etiquetas visibles, descripciones de los artículos, navegación nombrada, foco visible y contraste alto. Ningún dato importante depende solo del color. Enlaces de salto al contenido.
- **Operable:** controles nativos utilizables con teclado, foco visible, botones y corazones de al menos 44 × 44 px y respeto a `prefers-reduced-motion`.
- **Comprensible:** idioma español declarado, formularios con etiquetas, `autocomplete`, tipos de entrada adecuados, requeridos señalados por validación del navegador, pasos de compra y textos de acción explícitos.
- **Robusto:** HTML5 semántico, landmarks, encabezados y controles nativos con nombres accesibles, sin dependencias externas; compatible con navegadores modernos y tecnologías de asistencia.

## Heurísticas de Nielsen consideradas

1. **Visibilidad del estado del sistema:** pasos del checkout, selección de opciones, resumen y confirmación.
2. **Correspondencia con el mundo real:** vocabulario familiar, categorías deportivas, precios, direcciones y plazos cotidianos.
3. **Control y libertad:** regreso a carrito/entrega y volver a la tienda antes o después de la simulación.
4. **Consistencia y estándares:** navegación, botones, formularios y progreso consistentes; controles HTML convencionales.
5. **Prevención de errores (parcial):** campos obligatorios de entrega y validación de entrada; el backend valida inventario en checkout, pero no se verifica ni procesa un pago.
6. **Reconocer en vez de recordar:** categorías visibles, progreso actual, resumen por etapa y lista de favoritos guardada en el navegador.
7. **Flexibilidad y eficiencia:** acceso por categoría, favoritos para comparar y camino de checkout corto; no hay atajos personalizados.
8. **Diseño estético y minimalista:** contenido comercial prioritario, pantallas de checkout sin elementos promocionales innecesarios.
9. **Ayudar a reconocer, diagnosticar y recuperarse de errores (no implementada):** sin sistema de pedidos o errores del servidor, no se ofrece recuperación contextual.
10. **Ayuda y documentación (no implementada en la interfaz):** se excluye la ayuda contextual; esta guía es documentación del entregable, no contenido de la tienda.
