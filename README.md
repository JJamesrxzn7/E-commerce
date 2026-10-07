# Apex Sports

Prototipo de interfaz de una tienda deportiva hecho con HTML, CSS y JavaScript vanilla. No necesita instalar dependencias; requiere servirse por HTTP para cargar el catálogo JSON.

## Ejecutar el proyecto

El catálogo se carga desde `data/products.json`, por lo que el sitio debe servirse mediante HTTP y no abrirse directamente como archivo `file://`. En VS Code puedes usar la extensión Live Server; también puedes iniciar Python desde la raíz del proyecto con `python -m http.server 8000` y abrir `http://localhost:8000`.

Para publicarlo, configura GitHub Pages en el repositorio con la rama `main` y la carpeta raíz (`/`).

## Archivos

- `index.html`: portada, categorías y estructura del catálogo.
- `estilos.css`: estilos, diseño responsive, foco de teclado y controles táctiles.
- `catalogo.js`: carga `data/products.json`, construye las tarjetas y genera los carruseles de portada y los enlaces «Ver más».
- `detalle-producto.js`: abre la ficha accesible de cada artículo y muestra productos relacionados de la misma categoría.
- `busqueda.js`: busca coincidencias parciales sin distinguir mayúsculas ni tildes en el nombre, categoría y descripción.
- `data/products.json`: fuente de datos de los 120 productos, con precio, descripción, ilustración única, texto alternativo y licencia.
- `images/products/`: ilustraciones originales de cada artículo, aislado sobre un fondo liso.
- `generar-ilustraciones.js`: genera nuevamente las 120 ilustraciones SVG locales desde el catálogo.
- `favoritos.js`: permite agregar/quitar favoritos, actualiza los botones y el contador, y guarda la lista en `localStorage` de este navegador.
- `carrito.js`: agrega productos, conserva cantidades en `localStorage` y actualiza el carrito y los resúmenes del flujo de compra.
- `pago.js`: valida los cuatro campos de tarjeta, muestra guías de transferencia/retiro, y al confirmar guarda un resumen de pedido en la sesión y vacía el carrito, sin almacenar datos financieros.
- `confirmacion.js`: presenta el resumen guardado del pedido y el método elegido, aunque el carrito ya esté vacío.
- `entrega-validacion.js`: valida los datos de entrega al salir de cada campo y al enviar el formulario, con mensajes y guías en español.
- `paginacion.js`: muestra hasta 15 productos por página en las categorías y favoritos; muestra controles solo si hay más de 15.
- `carrito.html`, `entrega.html`, `pago.html`, `pedido-confirmado.html`: pantallas de demostración para el flujo de compra.
- `flujo-y-criterios.md`: documentación del flujo, criterios de accesibilidad y decisiones de interfaz.

## Organización del código

Las páginas HTML separan las etapas del prototipo (catálogo, carrito y checkout); los scripts JavaScript separan funciones independientes como catálogo, búsqueda, favoritos, paginación y carrito. No es necesario concentrar todo en un único archivo: mantener responsabilidades separadas facilita encontrar y modificar una función sin duplicar datos. El catálogo de productos tiene una sola fuente de datos en `data/products.json`.

Las tarjetas ya no incluyen el botón «Añadir al carrito». Al activar la imagen o el contenido del producto se abre su ficha con la descripción, el precio, selector de cantidad, acción para añadir y recomendaciones relacionadas. La cantidad se puede escribir con dígitos o ajustar con los botones +/−, sin el incrementador nativo del campo; la dirección de la ficha puede compartirse o recargarse. En entrega y pago se muestra la tarifa que corresponde a la opción elegida y el total exacto del pedido; el retiro local no suma envío.

## Ilustraciones de producto

Cada artículo tiene su propia ilustración vectorial SVG, generada para representar el producto sin escenas, personas ni objetos decorativos. Las ilustraciones son originales de Apex Sports y se ofrecen bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Para regenerarlas después de modificar el catálogo, ejecuta `node generar-ilustraciones.js` desde la raíz del proyecto. No necesitan servicios externos; el catálogo aún requiere servirse por HTTP para cargar el archivo JSON.

## Alcance de la demostración

El catálogo, carrito, entrega y pago son una simulación de interfaz. No hay base de datos, inicio de sesión, control de acceso real, envío de pedidos ni procesamiento de pagos. La pantalla de tarjeta valida el formato de los campos en el navegador, pero no transmite ni conserva esos campos. La cuenta de Banco Pichincha y la ubicación del retiro son de ejemplo y se identifican en el aviso de simulación. Los favoritos se guardan localmente en el navegador; al borrar sus datos o usar otro dispositivo, no se sincronizan.

## Publicación

El sitio puede servirse directamente desde la raíz de la rama `main` con GitHub Pages, sin proceso de compilación.
