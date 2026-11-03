# Apex Sports: guía de la tienda

Esta guía documenta el diseño; no forma parte de las pantallas de la tienda.

## Alcance y decisiones

- Interfaz responsive implementada con HTML semántico, CSS y JavaScript, integrada con una API FastAPI para catálogo, autenticación, carrito, favoritos por cuenta y creación de pedidos.
- El storefront tiene ocho documentos HTML independientes: `index.html`, `categoria.html`, `producto.html`, `favoritos.html`, `carrito.html`, `entrega.html`, `pago.html` y `pedido-confirmado.html`. Las rutas de categoría y ficha usan parámetros `id`; no se cuentan estados internos como páginas adicionales. Solo se ofrecen las primeras cuatro categorías del catálogo y hasta diez artículos por cada una; la API permanece intacta.
- La API conserva el catálogo de 120 artículos y sus 12 categorías. La interfaz muestra solo las primeras cuatro (Fútbol, Basketball, Tennis y Artes marciales), con un máximo de diez artículos por categoría. La portada mantiene carruseles horizontales de esos artículos y las páginas de categoría los muestran sin paginación.
- La tienda y sus imágenes usan diseños fluidos: tarjetas que se adaptan al ancho disponible, imágenes con recorte `object-fit: cover` y controles con un mínimo táctil de 44 × 44 px.
- Paleta limitada a cinco colores: azul profundo `#17324D` (dominante), marfil `#F4F1E8` y terracota `#A84328` (secundarios), gris `#667581` y blanco `#FFFFFF` (complementarios).
- La compra requiere añadir productos, continuar desde el carrito y entrega, y confirmar el pedido pendiente. El checkout crea el pedido en la API, pero no procesa pagos ni autoriza despacho.
- La pantalla de pago confirma sólo pedidos pendientes de pago. No se piden datos de tarjeta ni se realizan transferencias; las antiguas opciones de pago demostrativas permanecen desactivadas. El destino de entrega se envía al checkout y queda asociado al pedido.
- La entrega estándar aparece seleccionada, pero tarifa y plazo no están configurados. La tarifa registrada por la API es cero; la interfaz avisa que no está configurada y no la presenta como tarifa comercial.
- Al seleccionar la imagen o los datos de un artículo se abre `producto.html`, una ficha independiente con imagen, descripción, precio, selector de cantidad, acción para añadir al carrito y hasta tres productos relacionados. La cantidad elegida se suma al carrito y puede ajustarse allí; los controles de cantidad son accesibles por teclado y cumplen el mínimo táctil de 44 px.
- Para guardar artículos en favoritos, se solicita una sesión. El enlace abre `favoritos.html`; la lista se lee y actualiza con los endpoints autenticados de la API y queda asociada a la cuenta.
- Al iniciar sesión, los corazones, el contador y la lista se hidratan desde el servidor. No se guarda una copia local de favoritos; la misma cuenta puede consultarlos desde otros dispositivos.
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

La búsqueda consulta los productos visibles cargados desde la API. Seleccionar la imagen o los datos de un producto abre su ficha independiente, con galería, descripción, precio, selector de cantidad, acción para añadir al carrito y hasta tres recomendaciones; **Volver a categorías** regresa a su categoría. Los controles de cantidad permiten definir unidades antes de añadirlas y ajustar el valor desde el carrito. Los botones del carrito y favoritos sincronizan cambios con API para usuarios autenticados. Las tarjetas de categoría usan iconos SVG dibujados para representar el deporte o equipo relacionado. La portada presenta las cuatro categorías visibles y sus carruseles horizontales; **Explorar categoría** abre su página HTML con un máximo de diez artículos.

## Ilustraciones de los productos

Cada artículo tiene su propia ilustración SVG original en `images/products/`. Cuando hay una fotografía local aportada por el usuario que corresponde al producto, el catálogo la muestra en su lugar; estas fotografías usan texto alternativo y conservan la atribución de autorización de uso. Las ilustraciones SVG usan texto alternativo y tienen licencia CC BY 4.0. Se pueden regenerar ejecutando `node generar-ilustraciones.js` desde la raíz del proyecto. Las ilustraciones son referenciales; no son fotografías oficiales de los modelos comerciales ficticios del prototipo.

Para cambiar la ilustración de un artículo, modifica su registro en `data/products.json` y la regla correspondiente del archivo `generar-ilustraciones.js`; luego ejecuta el generador. Las imágenes locales responden y se muestran sin depender de un servicio externo.

## Flujo de navegación: diagrama de estados

```mermaid
stateDiagram-v2
    [*] --> InicioCatalogo
    InicioCatalogo --> Categoria: Elegir / explorar categoría
    Categoria --> ProductoSeleccionado: Abrir ficha del producto
    ProductoSeleccionado --> Categoria: Volver a categorías
    InicioCatalogo --> Favoritos: Abrir Favoritos / guardar producto
    Favoritos --> InicioCatalogo: Seguir explorando
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
2. Al completar el acceso se guarda o muestra la lista de la cuenta; revisar el contador y abrir Favoritos cuando se quiera comparar.
3. Quitar un producto con su botón de corazón o volver al catálogo para seguir explorando. Solo se muestran artículos de las cuatro categorías visibles.

### Objetivo: explorar una categoría desde la portada

1. Revisar las categorías disponibles y recorrer el carrusel con gesto horizontal o con sus botones de flecha.
2. Recorrer los productos destacados con el carrusel o activar el enlace **Explorar categoría**.
3. La vista exclusiva muestra hasta diez productos de la categoría, sin paginación.

## Respuesta del sistema / feedback

| Interacción | Feedback |
|---|---|
| Enlace de categoría o producto | Abre la página HTML independiente de categoría o ficha con recomendaciones relacionadas. |
| Búsqueda | Filtra en tiempo real los productos visibles del catálogo; el término se conserva como parámetro de URL. |
| Envío con campos incompletos | Validación personalizada en español, foco en el primer control inválido y mensaje asociado. |
| Selección de entrega | La opción marcada es visible; tarifa y total aparecen como no configurados hasta acordar reglas comerciales. El snapshot se conserva en la orden. |
| Selección de pago | La única opción habilitada es confirmar un pedido pendiente; no se solicitan tarjetas ni se procesan transferencias o pagos en local. |
| Añadir al carrito desde la ficha | El contador del carrito se actualiza y el botón confirma la acción; permanece visible la ficha del producto. |
| Seleccionar cantidad en la ficha | Los controles −/+ y el campo numérico actualizan la cantidad; el carrito recibe las unidades seleccionadas. |
| Abrir Favoritos o activar un corazón sin sesión | Se muestra el diálogo con las opciones de iniciar sesión y crear cuenta. Al autenticar se completa la navegación o el cambio de favorito; cerrar el diálogo cancela la acción. |
| Agregar o quitar favorito con sesión | El corazón cambia entre seleccionado/no seleccionado, se actualiza el contador y se anuncia el nombre del artículo; en la lista se refleja el cambio. |
| Continuar con la entrega sin sesión | Se muestra el diálogo de acceso; al autenticar se abre Entrega y al cerrar el diálogo se permanece en el carrito. |
| Recomendaciones | La ficha presenta hasta tres productos relacionados; seleccionar uno abre su propia ficha. |
| Confirmación | Tras crear el pedido, muestra el resumen pendiente de pago y conserva una copia durante la sesión. Sin pedido reciente, informa el estado vacío y no muestra datos de confirmación. |

## WCAG 2.2: cuatro principios

- **Perceptible:** jerarquía de encabezados, etiquetas visibles, descripciones de los artículos, navegación nombrada, foco visible y contraste alto. Ningún dato importante depende solo del color. Enlaces de salto al contenido.
- **Operable:** controles nativos utilizables con teclado, foco visible, botones y corazones de al menos 44 × 44 px y respeto a `prefers-reduced-motion`.
- **Comprensible:** idioma español declarado, formularios con etiquetas, `autocomplete`, tipos de entrada adecuados, requeridos señalados por validación del navegador, pasos de compra y textos de acción explícitos.
- **Robusto:** HTML5 semántico, landmarks, encabezados y controles nativos con nombres accesibles, sin dependencias externas; compatible con navegadores modernos y tecnologías de asistencia.

## Registro de revisión responsive y accesibilidad

Revisión ejecutada el 3 de noviembre de 2026 sobre la versión local del storefront, con catálogo servido por la API configurada. Se cubrieron `index.html`, `categoria.html?id=futbol`, `producto.html?id=futbol-balon-pro-match`, `favoritos.html`, `carrito.html`, `entrega.html`, `pago.html` y `pedido-confirmado.html`.

- **Comprobaciones automatizadas en navegador:** a 1440 × 1000 y 390 × 844 px se verificó un `<main>` por documento, ausencia de IDs duplicados, texto alternativo en todas las imágenes, nombres accesibles en controles, etiquetas en campos de formulario y ausencia de desbordamiento horizontal. Resultado: cero fallos en esas comprobaciones.
- **Contraste de texto:** revisión programática de los textos visibles con umbrales AA de 4,5:1 para texto normal y 3:1 para texto grande. Se corrigieron dos contrastes insuficientes (texto de la llamada principal y pestaña inactiva del diálogo); al repetir la comprobación no se encontraron fallos.
- **Revisión manual con teclado:** se recorrió el enlace “Saltar al contenido”, se comprobó el foco visible y el primer tramo de tabulación en la ficha; en Favoritos se llegó al botón “Cerrar” del diálogo con Tab y se activó con Enter. El diálogo canceló la acción sin cuenta ni datos personales.
- **Límites:** no se encontró axe ni Lighthouse instalado. No se probaron lector de pantalla, ampliación al 200/400 %, todos los criterios WCAG 2.2 ni navegadores adicionales. Los resultados no constituyen una certificación de conformidad WCAG 2.2 AA.
- **Reproducción:** abrir las ocho rutas anteriores en el navegador, comprobarlas en ambos viewports y repetir la navegación con Tab/Enter; usar un estado sin sesión y no completar checkout ni crear pedidos.

## Heurísticas de Nielsen consideradas

1. **Visibilidad del estado del sistema:** pasos del checkout, selección de opciones, resumen, confirmación y estado vacío cuando no hay pedido reciente.
2. **Correspondencia con el mundo real:** vocabulario familiar, categorías deportivas, precios, direcciones y plazos cotidianos.
3. **Control y libertad:** regreso a carrito/entrega y volver a la tienda antes o después de la simulación.
4. **Consistencia y estándares:** navegación, botones, formularios y progreso consistentes; controles HTML convencionales.
5. **Prevención de errores (parcial):** campos obligatorios de entrega y validación de entrada; el backend valida inventario en checkout, pero no se verifica ni procesa un pago.
6. **Reconocer en vez de recordar:** categorías visibles, progreso actual, resumen por etapa y lista de favoritos asociada a la cuenta y sincronizada mediante la API.
7. **Flexibilidad y eficiencia:** acceso por categoría, favoritos para comparar y camino de checkout corto; no hay atajos personalizados.
8. **Diseño estético y minimalista:** contenido comercial prioritario, pantallas de checkout sin elementos promocionales innecesarios.
9. **Ayudar a reconocer, diagnosticar y recuperarse de errores (no implementada):** sin sistema de pedidos o errores del servidor, no se ofrece recuperación contextual.
10. **Ayuda y documentación (no implementada en la interfaz):** se excluye la ayuda contextual; esta guía es documentación del entregable, no contenido de la tienda.
