# Apex Sports

Prototipo de interfaz de una tienda deportiva hecho con HTML, CSS y JavaScript vanilla. No necesita instalar dependencias ni tiene servidor.

## Abrir el proyecto

Abre `index.html` en un navegador. Para publicarlo, configura GitHub Pages en el repositorio con la rama `main` y la carpeta raíz (`/`).

## Archivos

- `index.html`: portada, categorías y catálogo.
- `estilos.css`: estilos, diseño responsive, foco de teclado y controles táctiles.
- `catalogo.js`: amplía el catálogo con productos demostrativos, agrega descripciones y genera los carruseles de portada y los enlaces «Ver más».
- `favoritos.js`: permite agregar/quitar favoritos, actualiza los botones y el contador, y guarda la lista en `localStorage` de este navegador.
- `paginacion.js`: muestra hasta 15 productos por página en las categorías y favoritos; muestra controles solo si hay más de 15.
- `carrito.html`, `entrega.html`, `pago.html`, `pedido-confirmado.html`: pantallas de demostración para el flujo de compra.
- `flujo-y-criterios.md`: documentación del flujo, criterios de accesibilidad y decisiones de interfaz.

## Alcance de la demostración

El catálogo, carrito, entrega y pago son una simulación de interfaz. No hay base de datos, inicio de sesión, control de acceso real, envío de pedidos ni procesamiento de pagos. Los favoritos se guardan localmente en el navegador; al borrar sus datos o usar otro dispositivo, no se sincronizan.

## Publicación

El sitio puede servirse directamente desde la raíz de la rama `main` con GitHub Pages, sin proceso de compilación.
