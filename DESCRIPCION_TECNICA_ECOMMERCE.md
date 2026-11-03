# Descripción técnica del e-commerce Apex Sports

## 1. Propósito

Apex Sports es una tienda web deportiva estática conectada parcialmente a una API. Permite explorar un catálogo organizado por categorías, buscar productos, consultar sus detalles, guardar favoritos, gestionar un carrito y crear pedidos pendientes de pago.

Este documento sirve como contexto técnico para otra página web, servicio o asistente que necesite comprender el proyecto. Describe la implementación actual, no una arquitectura futura.

## 2. Resumen para integrar con otra plataforma

> Apex Sports es un storefront de equipamiento deportivo implementado como sitio estático con HTML semántico, CSS y JavaScript vanilla. El catálogo se obtiene desde una API FastAPI; los productos tienen identificador público, descripción, precio en centavos y una ruta de imagen local WebP o SVG. La portada permite navegar por categorías, buscar, abrir fichas, marcar favoritos y gestionar el carrito. Autenticación, catálogo, carrito, favoritos por cuenta y creación del pedido tienen integración API en el código local. La confirmación todavía usa datos de la pestaña en lugar de consultar siempre la API. La URL de API publicada debe configurarse antes de `api-client.js`. El pago es demostrativo y no procesa dinero. El registro pide datos mínimos de cuenta más cédula/RUC y ciudad; teléfono y destino se ingresan en cada pedido. Cada orden conserva su propio snapshot de entrega, separado del perfil del cliente.

## 3. Tecnologías y arquitectura

- **Frontend:** HTML5, CSS3 y JavaScript moderno sin framework.
- **Datos de catálogo:** API FastAPI; `data/products.json` se conserva como fixture y entrada del generador de imágenes.
- **API:** FastAPI versionada bajo `/api/v1` para catálogo, autenticación, carrito y checkout.
- **Recursos de producto:** fotografías WebP e ilustraciones SVG locales en `images/` e `images/products/`.
- **Persistencia del prototipo:** `localStorage` y `sessionStorage` del navegador.
- **Dependencias de ejecución:** no requiere gestor de paquetes ni proceso de compilación.
- **Carga local:** requiere HTTP y una API accesible; abrir `index.html` mediante `file://` no es el flujo esperado.
- **Publicación compatible:** sitio estático, por ejemplo GitHub Pages desde la raíz del repositorio.

La aplicación está dividida por responsabilidad: documentos HTML definen las pantallas, JavaScript implementa el comportamiento y CSS contiene el estilo compartido. Los scripts se cargan con `defer`; en la página principal, `catalogo.js` construye el catálogo y emite el evento `catalog:ready`, que usan los scripts que necesitan las tarjetas ya creadas.

## 4. Estructura del proyecto

| Ruta | Responsabilidad |
|---|---|
| `index.html` | Portada, búsqueda, categorías, tarjetas/carruseles dinámicos, favoritos y diálogo de acceso. |
| `carrito.html` | Vista del carrito, modificación de cantidades, eliminación de artículos y resumen. |
| `entrega.html` | Datos de contacto/dirección, selección de envío y resumen del pedido. |
| `pago.html` | Selección del método de pago, validación de demostración y total. |
| `pedido-confirmado.html` | Presentación del resumen guardado en la sesión actual. |
| `estilos.css` | Estilos comunes, responsive, estados, componentes y foco visible. |
| `data/products.json` | Catálogo/fixture de desarrollo y fuente de rutas locales para las fotografías autorizadas. |
| `images/products/` | Fotografías WebP de productos visibles e ilustraciones SVG locales para el resto del catálogo. |
| `catalogo.js` | Obtiene todas las páginas del catálogo de API, valida productos y construye tarjetas/carruseles. |
| `detalle-producto.js` | Muestra detalles del producto seleccionado y recomendaciones. |
| `busqueda.js` | Filtra los productos de acuerdo con la consulta en la URL. |
| `api-client.js` | Cliente HTTP autenticado; recibe la base URL desde `window.APEX_API_BASE` o usa localhost para desarrollo. |
| `favoritos.js` | Sincroniza los botones y la lista de favoritos de la portada con la API para la cuenta iniciada. |
| `carrito.js` | Sincroniza carrito autenticado con API y combina carrito de invitado al iniciar sesión. |
| `entrega-validacion.js` | Valida teléfono y dirección/ciudad elegidas para el pedido actual. |
| `pago.js` | Envía un checkout de demostración a la API con clave de idempotencia. |
| `confirmacion.js` | Presenta el pedido; actualmente depende de la respuesta guardada en la sesión del navegador. |
| `auth.js` | Registro/login/logout vía API y reanudación de acciones que requieren sesión. |
| `generar-ilustraciones.js` | Genera las ilustraciones SVG locales y conserva las fotografías aportadas usando el catálogo como entrada. |
| `informe-productos-para-imagenes-ia.md` | Checklist de los 120 nombres de producto, distribuidos en 12 categorías, para producir imágenes. |
| `AUDITORIA.md` | Auditoría de riesgos y limitaciones del prototipo. |
| `flujo-y-criterios.md` | Decisiones de interacción, accesibilidad y flujo de compra. |

## 5. Catálogo y modelo de datos

El fixture `data/products.json` contiene un objeto raíz con `version` y una lista `products`; sirve para generar ilustraciones y como referencia local de imágenes. La API y el fixture conservan 120 artículos en 12 categorías. Para la interfaz, `catalogo-compartido.js` limita la oferta a las primeras cuatro categorías (Fútbol, Basketball, Tennis y Artes marciales) y a los primeros diez artículos de cada una; también aplica las fotografías locales autorizadas por ID sin modificar la API ni sus datos.

Forma representativa de un producto con fotografía aportada:

```json
{
  "categoryId": "basketball",
  "categoryLabel": "Basketball",
  "category": "Basketball · Balones",
  "name": "Balón Court One",
  "description": "Balón de basketball para partidos y prácticas en cancha.",
  "priceCents": 2950,
  "id": "basketball-balon-court-one",
  "imageUrl": "images/products/basketball-balon-court-one.webp",
  "imageAlt": "Balón Court One, fotografía de producto",
  "imageCredit": "Usuario (autorización de uso confirmada)",
  "imageLicense": "Autorización de uso confirmada por el usuario",
  "imageSourceUrl": "images/products/basketball-balon-court-one.webp",
  "imageSourceTitle": "Fotografía de producto aportada por el usuario"
}
```

### Contrato de campos

- `id`: identificador estable del producto; lo usa la ficha de producto.
- `categoryId`: debe coincidir con el identificador de una sección de categoría presente en `index.html`.
- `categoryLabel` y `category`: nombre de categoría general y clasificación visible del artículo.
- `name` y `description`: texto mostrado y contenido que usa la búsqueda.
- `priceCents`: precio entero en centavos; evita usar números decimales como fuente de cálculo.
- `imageUrl`: ubicación de la fotografía o ilustración.
- `imageAlt`: nombre y descripción del artículo, pensado para tecnologías de asistencia.
- `imageCredit`, `imageLicense`, `imageLicenseUrl`, `imageSourceUrl`, `imageSourceTitle`: crédito y referencia de licencia/origen.

Al añadir productos, hay que incorporarlos en la fuente de catálogo del backend y asegurar que la API devuelva categorías y rutas de imagen válidas. Actualiza el fixture local sólo cuando corresponda al flujo de generación de ilustraciones.

## 6. Interfaz y capacidades

### 6.1 Portada y navegación

- El encabezado ofrece marca, buscador, acceso al carrito, contador de artículos, favoritos y acceso de demostración.
- El encabezado principal permanece visible al desplazarse.
- Las categorías tienen enlaces internos y se muestran mediante vistas por sección.
- La portada crea carruseles horizontales con productos destacados y un enlace «Explorar categoría». Ya no añade una tarjeta «Ver más».
- Las tarjetas se generan a partir del JSON, no se mantienen manualmente en el HTML.

### 6.2 Búsqueda

- La consulta se envía como parámetro `q` en la URL.
- Busca coincidencias parciales en nombre, categoría y descripción.
- Normaliza mayúsculas y tildes para que consultas como «balon» encuentren «Balón».
- Presenta cantidad de resultados o estado vacío si no hay coincidencias.

### 6.3 Detalle del producto

- La selección de una tarjeta abre el detalle a través del hash `#producto/{id}`.
- Muestra ilustración, categoría, nombre, precio y descripción.
- Permite escoger unidades con botones más/menos o escribir dígitos.
- Añade la cantidad elegida al carrito sin redirigir de forma automática.
- Recomienda otros artículos, primero de la misma categoría.

### 6.4 Favoritos

- Cada artículo tiene un botón de favorito con nombre accesible dinámico y estado `aria-pressed`.
- Al activar un corazón o abrir Favoritos sin sesión, se solicita iniciar sesión o crear una cuenta; después de autenticar se completa la acción solicitada.
- La lista se consulta y actualiza en la API autenticada; los favoritos quedan asociados a la cuenta y se pueden consultar desde otros dispositivos.
- La sección Favoritos muestra los productos seleccionados y permite quitarlos o agregarlos al carrito.
- Las páginas de categoría muestran hasta diez productos; la interfaz solo ofrece las primeras cuatro categorías del catálogo.
- La lista de favoritos muestra los productos guardados que pertenecen a esas categorías visibles.

### 6.5 Carrito

- El carrito autenticado se consulta y actualiza en la API; el carrito de invitado se conserva en `localStorage` bajo `apex-sports-cart` y se intenta fusionar al iniciar sesión.
- Agregar un producto actualiza el carrito y el contador, sin forzar navegación.
- La vista del carrito permite aumentar o reducir unidades (mínimo uno) y quitar productos.
- El subtotal del carrito autenticado se calcula con los precios devueltos por la API; el backend valida precios, stock y cantidades en checkout.
- La región de estado anuncia en español adiciones, cambios y errores a tecnologías de asistencia.

### 6.6 Entrega

- **Continuar con la entrega** desde el carrito requiere una sesión de API; también se solicita acceso si se abre directamente esa pantalla.
- Se solicitan teléfono, dirección, ciudad y referencia opcional para cada pedido. No se piden nuevamente nombre/correo, ya asociados a la cuenta.
- La dirección es elegida para el pedido actual (casa, trabajo u otro lugar); no actualiza `CLIENTES.cli_Direccion`.
- El formulario valida teléfono, dirección y ciudad al perder foco y al enviar.
- Se muestran mensajes y orientación de entrada en español.
- El costo se muestra como no configurado; la API actualmente registra tarifa cero.
- Los datos se guardan temporalmente en sesión y se envían a `POST /api/v1/checkout`, que conserva un snapshot por pedido.

### 6.7 Pago y confirmación

- La opción activa es un pedido de demostración pendiente; no hay proveedor ni cobro real.
- `pago.js` envía pedido y destino a `POST /api/v1/checkout`, usa `Idempotency-Key` y limpia el carrito tras una respuesta exitosa.
- La API registra el pedido, líneas, snapshots de dirección, reserva de stock y estado de pago `NOT_PROCESSED`.
- La confirmación local presenta la respuesta guardada en `sessionStorage`; debería volver a consultar `GET /api/v1/orders/{id}` para que el servidor sea fuente de verdad.

### 6.8 Cuenta y autenticación

- El diálogo permite registrar cliente, iniciar sesión y cerrar sesión mediante la API.
- El mismo diálogo se reutiliza en la tienda, el carrito y la entrega; las acciones de favoritos y la continuación del checkout se reanudan tras autenticar.
- `auth-modal.js` construye el diálogo compartido; `auth.js` gestiona la sesión API y la continuación/cancelación de la acción protegida.
- El token bearer y los datos básicos del usuario se guardan en `sessionStorage` por pestaña.
- El formulario reducido pide nombre, correo, cédula/RUC, ciudad y contraseña; el backend debe permitir omitir teléfono y dirección al registrar.
- La API usa Argon2id y sesiones opacas con revocación/expiración.
- Los favoritos se consultan y actualizan mediante `/favorites` y quedan asociados a la cuenta autenticada.

## 7. Persistencia actual

| Dato | Ubicación | Alcance y duración |
|---|---|---|
| Catálogo | API `/products` (JSON como fixture) | Productos, precio e inventario leídos desde servidor. |
| Carrito invitado | `localStorage` (`apex-sports-cart`) | Mismo navegador; se intenta fusionar al iniciar sesión. |
| Carrito autenticado | API `/cart` | Asociado a la cuenta y persistido por servidor. |
| Favoritos | API (`GET`, `PUT` y `DELETE /favorites`) | Persistidos en el servidor por cuenta; se vuelven a consultar al iniciar sesión. |
| Token y usuario | `sessionStorage` (`apex-api-token-v1`, `apex-api-user-v1`) | Sesión de la pestaña; token expira/revoca en el servidor. |
| Pedido reciente | `sessionStorage` (`apex-sports-last-order`) | Copia temporal de la respuesta; la orden autoritativa está en la API. |
| Datos de tarjeta | No se recopilan | La opción de tarjeta está deshabilitada; el sitio no solicita ni envía datos financieros. |

Cambiar navegador, dispositivo, perfil u origen separa los datos de sesión local, pero no la lista de favoritos asociada a la cuenta.

## 8. Accesibilidad y adaptación

- HTML semántico para encabezados, navegación, formularios, enlaces y botones.
- Jerarquía de contenido: encabezado principal, categorías con `<h2>` y productos con `<h3>`.
- Etiqueta de búsqueda asociada al campo mediante `for` e `id`.
- Textos alternativos descriptivos para ilustraciones, con ancho y alto intrínsecos para reservar su espacio de carga.
- Nombres accesibles para controles de icono: acciones de favoritos, carrusel, cantidad y eliminación del carrito.
- Regiones `aria-live` para comunicar cambios de carrito, favoritos, resultados y estado.
- Foco visible, controles nativos operables con teclado y enlace «Saltar al contenido».
- Diseño responsive con puntos de adaptación para escritorio, tableta y móvil.

Estas características ayudan a la accesibilidad, pero no equivalen por sí solas a una certificación WCAG. Conviene ejecutar pruebas con lector de pantalla y evaluadores automáticos al cambiar la interfaz.

## 9. Ejecución local

Desde la raíz del repositorio:

```powershell
python -m http.server 8000
```

Abrir `http://localhost:8000/`. También se puede usar Live Server en VS Code. No se requiere `npm install`.

Para regenerar las ilustraciones con Node.js:

```powershell
node generar-ilustraciones.js
```

## 10. Límites y pendientes de integración

La integración de API está en progreso; el archivo `PENDIENTES_API_PARA_ECOMMERCE.md` contiene el contrato detallado para el backend. Para publicar la tienda conectada:

1. Configurar `window.APEX_API_BASE` con la URL HTTPS real antes de cargar `api-client.js`; no publicar secretos.
2. Desplegar la versión de API compatible con registro reducido (sin teléfono/dirección obligatorios).
3. Mantener la versión de API que expone las rutas autenticadas de favoritos y validar la sincronización con una cuenta de prueba.
4. Leer confirmación e historial desde recursos de pedidos protegidos.
5. Mantener dirección de entrega como snapshot por orden, nunca como dirección implícita del perfil.
6. Configurar precios/tarifas/impuestos y pasarela antes de presentar compra real; nunca afirmar que una orden de demo fue pagada.
7. Validar flujos completos desde GitHub Pages y la URL de API desplegada.

## 11. Contexto corto reutilizable

Para pasar una descripción compacta a otra herramienta:

```text
Estoy trabajando en Apex Sports, un storefront deportivo estático en HTML, CSS y JavaScript vanilla, integrado parcialmente con una API FastAPI. Requiere HTTP y configuración de la URL API. El catálogo se obtiene de la API; data/products.json sirve como fixture/generador de ilustraciones SVG locales. La portada incluye búsqueda, categorías y carruseles; cada ficha permite cambiar cantidad y añadir al carrito. Autenticación, carrito autenticado, favoritos asociados a la cuenta y creación del pedido usan la API. La confirmación depende de sessionStorage. Registro requiere nombre, correo, cédula/RUC, ciudad y contraseña; teléfono y destino se ingresan por pedido y la dirección se conserva en el snapshot de esa orden, no en el perfil. El checkout deja el pedido pendiente y no procesa pagos. Conserva etiquetas, nombres accesibles, texto alternativo, regiones aria-live y diseño responsive; no presentes pagos ni funciones pendientes como reales.
```
