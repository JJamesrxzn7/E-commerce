# Apex Sports

Storefront de una tienda deportiva hecho con HTML, CSS y JavaScript vanilla. No necesita instalar dependencias, pero debe servirse por HTTP y requiere que la API esté disponible para cargar el catálogo y completar autenticación, carrito y checkout.

## Ejecutar el proyecto

El catálogo se carga desde la API, por lo que el sitio y la API deben estar disponibles por HTTP; abrir `index.html` directamente como `file://` no funciona. En VS Code puedes usar Live Server o iniciar Python desde la raíz con `python -m http.server 8000` y abrir `http://localhost:8000`. `api-config.js` define la URL HTTPS pública usada por GitHub Pages antes de cargar el cliente; para desarrollo local puedes cambiarla a `http://127.0.0.1:8000/api/v1`. Esa configuración es pública y no debe contener secretos.

Para publicarlo, configura GitHub Pages en el repositorio con la rama `main` y la carpeta raíz (`/`).

## Archivos

- `index.html`: portada, categorías destacadas, búsqueda y enlaces de navegación.
- `categoria.html`: página independiente de una de las cuatro categorías visibles (Fútbol, Basketball, Tennis y Artes marciales), seleccionada mediante `?id=`; muestra hasta diez productos.
- `producto.html`: ficha independiente con galería, cantidad y recomendaciones para los productos visibles.
- `favoritos.html`: lista de favoritos de la cuenta, cargada desde la API tras iniciar sesión.
- `estilos.css`: estilos, diseño responsive, foco de teclado y controles táctiles.
- `catalogo.js`: carga el catálogo paginado desde la API, construye las tarjetas y genera los carruseles de portada.
- `catalogo-compartido.js` y `catalogo-paginas.js`: conservan la respuesta de la API, pero muestran solo productos con stock en las primeras cuatro categorías y hasta diez productos disponibles por categoría.
- `detalle-producto.js`: abre la ficha accesible de cada artículo, carga su galería desde la API y muestra productos relacionados de la misma categoría.
- `busqueda.js`: busca coincidencias parciales sin distinguir mayúsculas ni tildes en el nombre, categoría y descripción.
- `data/products.json`: fixture y entrada del generador; también registra las fotografías locales autorizadas que se muestran junto con los datos del catálogo de la API.
- `images/`: fotos WebP optimizadas para los primeros nueve productos de fútbol.
- `images/products/`: fotos WebP aportadas para Balón Training y los diez productos de Basketball, Tennis y Artes marciales, además de ilustraciones SVG para el resto del catálogo.
- `generar-ilustraciones.js`: regenera las ilustraciones SVG, asigna las fotos WebP de fútbol y conserva las fotografías aportadas.
- `api-config.js`: define la URL HTTPS pública de la API, cargada antes de `api-client.js` en todas las páginas.
- `api-client.js`: realiza solicitudes a la API usando la base definida por `api-config.js`, incluidos los endpoints de favoritos.
- `favoritos.js` y `catalogo-paginas.js`: solicitan sesión y sincronizan botones, contador y lista de favoritos con la cuenta mediante la API; no usan `localStorage`.
- `auth-modal.js` y `auth.js`: muestran el diálogo compartido y registran/inician/cerran sesión con la API. El registro pide nombre, correo, cédula/RUC, ciudad y contraseña; el backend debe aceptar el contrato reducido documentado en `PENDIENTES_API_PARA_ECOMMERCE.md`.
- `carrito.js`: combina el carrito de invitado con el carrito autenticado de la API y permite agregar, quitar y cambiar cantidades.
- `pago.js`: envía el pedido a la API con idempotencia. El pago es demostrativo: no se cobran ni se transmiten datos financieros.
- `confirmacion.js`: presenta la respuesta del pedido guardada temporalmente en la pestaña; queda pendiente consultar siempre el registro autoritativo de la API.
- `entrega-validacion.js`: valida el teléfono y el destino elegidos para cada pedido; no modifica la dirección de perfil.
- `carrito.html`, `entrega.html`, `pago.html`, `pedido-confirmado.html`: pantallas del flujo de compra.
- `flujo-y-criterios.md`: documentación del flujo, criterios de accesibilidad y decisiones de interfaz.

## Organización del código

El storefront tiene ocho documentos HTML independientes: inicio, categoría, ficha, favoritos, carrito, entrega, pago y confirmación. La interfaz muestra únicamente productos con stock en Fútbol, Basketball, Tennis y Artes marciales, con hasta diez productos disponibles por categoría; los artículos agotados no aparecen y la API y su catálogo no se modifican. `data/products.json` se conserva como fixture y entrada del generador de ilustraciones. La página de favoritos muestra los artículos guardados que siguen disponibles en las categorías visibles. Al abrir Favoritos o continuar desde el carrito a Entrega se solicita iniciar sesión o crear una cuenta; la acción continúa tras autenticar y se cancela si se cierra el diálogo.

El envío cuesta $2,00 estándar o $6,00 express; el retiro no tiene costo de envío. La API calcula el total autoritativo. El checkout ofrece tarjeta y transferencia simuladas o pago pendiente al retirar; no procesa cobros ni confirma transferencias. WhatsApp abre un mensaje preparado y el cliente debe adjuntar y enviar el comprobante manualmente. El frontend requiere la versión de la API con la migración 005 aplicada para este flujo.

Las imágenes del catálogo y el detalle tienen texto alternativo derivado de los datos de producto y dimensiones intrínsecas. Las tarjetas de la portada priorizan la navegación y los favoritos; las páginas de categoría, ficha y favoritos incluyen la acción de añadir al carrito cuando el producto está disponible. En entrega se piden los datos de contacto y la dirección de ese pedido; la persona puede elegir casa, trabajo u otro lugar. La dirección del pedido no actualiza la dirección del cliente. El backend guarda los datos como snapshot del pedido. Tarifas e impuestos siguen sin estar configurados.

## Ilustraciones de producto

Los productos sin fotografía usan ilustraciones vectoriales SVG originales de Apex Sports, disponibles bajo [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Las fotografías adicionales fueron aportadas por el usuario, quien confirmó contar con autorización para publicarlas. `catalogo-compartido.js` aplica esas rutas locales a los productos correspondientes sin modificar la API. Para regenerar las ilustraciones después de modificar el fixture, ejecuta `node generar-ilustraciones.js` desde la raíz del proyecto; el script conserva las fotografías aportadas y valida que sus archivos existan.

## Estado de integración y límites

El storefront consume una API FastAPI para catálogo, autenticación, carrito y checkout; el servicio usa PostgreSQL para sus operaciones implementadas. `api-config.js` configura la URL HTTPS pública mediante `window.APEX_API_BASE`; no se debe publicar `DATABASE_URL` ni otros secretos.

El contrato de registro del frontend ya no pide teléfono ni dirección, pero la API debe actualizarse para aceptar esos campos opcionales y crear `CLIENTES` con nombre/correo/cédula/ciudad. Los favoritos usan `GET /favorites`, `PUT /favorites/{product_slug}` y `DELETE /favorites/{product_slug}` para persistir por cuenta y sincronizarse al iniciar sesión. La confirmación del pedido y su historial deben consultar la API para persistir entre sesiones. El checkout conserva teléfono y destino para cada pedido, y no procesa pagos reales; el método es demostrativo, sin tarifa de envío ni impuestos configurados. Consultar `PENDIENTES_API_PARA_ECOMMERCE.md` para las brechas restantes.

## Publicación

El sitio puede servirse desde la raíz de la rama `main` con GitHub Pages, sin proceso de compilación. Para que las funciones API trabajen desde esa publicación, mantener `api-config.js` antes de `api-client.js` en cada página y permitir el origen de GitHub Pages en CORS.
