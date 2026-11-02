# Apex Sports

Storefront de una tienda deportiva hecho con HTML, CSS y JavaScript vanilla. No necesita instalar dependencias, pero debe servirse por HTTP y requiere que la API esté disponible para cargar el catálogo y completar autenticación, carrito y checkout.

## Ejecutar el proyecto

El catálogo se carga desde la API, por lo que el sitio y la API deben estar disponibles por HTTP; abrir `index.html` directamente como `file://` no funciona. En VS Code puedes usar Live Server o iniciar Python desde la raíz con `python -m http.server 8000` y abrir `http://localhost:8000`. `api-config.js` define la URL HTTPS pública usada por GitHub Pages antes de cargar el cliente; para desarrollo local puedes cambiarla a `http://127.0.0.1:8000/api/v1`. Esa configuración es pública y no debe contener secretos.

Para publicarlo, configura GitHub Pages en el repositorio con la rama `main` y la carpeta raíz (`/`).

## Archivos

- `index.html`: portada, categorías y estructura del catálogo.
- `estilos.css`: estilos, diseño responsive, foco de teclado y controles táctiles.
- `catalogo.js`: carga el catálogo paginado desde la API, construye las tarjetas y genera los carruseles de portada.
- `detalle-producto.js`: abre la ficha accesible de cada artículo y muestra productos relacionados de la misma categoría.
- `busqueda.js`: busca coincidencias parciales sin distinguir mayúsculas ni tildes en el nombre, categoría y descripción.
- `data/products.json`: fixture y entrada del generador de ilustraciones; el catálogo visible se obtiene desde la API.
- `images/products/`: ilustraciones originales de cada artículo, aislado sobre un fondo liso.
- `generar-ilustraciones.js`: genera nuevamente las 120 ilustraciones SVG locales desde el catálogo.
- `api-config.js`: define la URL HTTPS pública de la API, cargada antes de `api-client.js` en todas las páginas.
- `api-client.js`: realiza solicitudes a la API usando la base definida por `api-config.js`.
- `favoritos.js`: solicita sesión para favoritos; actualmente guarda la lista en `localStorage` y requiere endpoints de API para sincronizarla con la cuenta.
- `auth-modal.js` y `auth.js`: muestran el diálogo compartido y registran/inician/cerran sesión con la API. El registro pide nombre, correo, cédula/RUC, ciudad y contraseña; el backend debe aceptar el contrato reducido documentado en `PENDIENTES_API_PARA_ECOMMERCE.md`.
- `carrito.js`: combina el carrito de invitado con el carrito autenticado de la API y permite agregar, quitar y cambiar cantidades.
- `pago.js`: envía el pedido a la API con idempotencia. El pago es demostrativo: no se cobran ni se transmiten datos financieros.
- `confirmacion.js`: presenta la respuesta del pedido guardada temporalmente en la pestaña; queda pendiente consultar siempre el registro autoritativo de la API.
- `entrega-validacion.js`: valida el teléfono y el destino elegidos para cada pedido; no modifica la dirección de perfil.
- `carrito.html`, `entrega.html`, `pago.html`, `pedido-confirmado.html`: pantallas de demostración para el flujo de compra.
- `flujo-y-criterios.md`: documentación del flujo, criterios de accesibilidad y decisiones de interfaz.

## Organización del código

Las páginas HTML separan las etapas de la tienda (catálogo, carrito y checkout); los scripts JavaScript separan funciones como catálogo, búsqueda, favoritos y carrito. El catálogo visible proviene de la API; `data/products.json` se conserva como fixture y entrada del generador de ilustraciones. Las secciones de deportes y favoritos muestran todos sus productos sin paginación. Al usar Favoritos o continuar desde el carrito a Entrega se solicita iniciar sesión o crear una cuenta; la acción continúa tras autenticar y se cancela si se cierra el diálogo.

Las imágenes del catálogo y el detalle tienen texto alternativo derivado de los datos de producto y dimensiones intrínsecas. Las tarjetas ya no incluyen el botón «Añadir al carrito». En entrega se piden los datos de contacto y la dirección de ese pedido; la persona puede elegir casa, trabajo u otro lugar. La dirección del pedido no actualiza la dirección del cliente. El backend guarda los datos como snapshot del pedido. Tarifas e impuestos siguen sin estar configurados.

## Ilustraciones de producto

Cada artículo tiene su propia ilustración vectorial SVG, generada para representar el producto sin escenas, personas ni objetos decorativos. Las ilustraciones son originales de Apex Sports y se ofrecen bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Para regenerarlas después de modificar el fixture, ejecuta `node generar-ilustraciones.js` desde la raíz del proyecto. No necesitan servicios externos; para la tienda integrada, la API debe devolver las rutas de imágenes válidas.

## Estado de integración y límites

El storefront consume una API FastAPI para catálogo, autenticación, carrito y checkout; el servicio usa PostgreSQL para sus operaciones implementadas. `api-config.js` configura la URL HTTPS pública mediante `window.APEX_API_BASE`; no se debe publicar `DATABASE_URL` ni otros secretos.

El contrato de registro del frontend ya no pide teléfono ni dirección, pero la API debe actualizarse para aceptar esos campos opcionales y crear `CLIENTES` con nombre/correo/cédula/ciudad. Los favoritos aún se guardan en `localStorage` porque no hay rutas API conectadas. La confirmación del pedido y su historial deben consultar la API para persistir entre sesiones. El checkout conserva teléfono y destino para cada pedido, y no procesa pagos reales; el método es demostrativo, sin tarifa de envío ni impuestos configurados. Consultar `PENDIENTES_API_PARA_ECOMMERCE.md` para coordinar el contrato con el agente de API.

## Publicación

El sitio puede servirse desde la raíz de la rama `main` con GitHub Pages, sin proceso de compilación. Para que las funciones API trabajen desde esa publicación, mantener `api-config.js` antes de `api-client.js` en cada página y permitir el origen de GitHub Pages en CORS.
