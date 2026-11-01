# Descripción técnica del e-commerce Apex Sports

## 1. Propósito

Apex Sports es un prototipo de tienda web deportiva. Permite explorar un catálogo organizado por categorías, buscar productos, consultar sus detalles, guardar favoritos, gestionar un carrito y recorrer una simulación de entrega y pago.

Este documento sirve como contexto técnico para otra página web, servicio o asistente que necesite comprender el proyecto. Describe la implementación actual, no una arquitectura futura.

## 2. Resumen para integrar con otra plataforma

> Apex Sports es un storefront demostrativo de equipamiento deportivo implementado como sitio estático con HTML semántico, CSS y JavaScript vanilla. El catálogo se carga desde `data/products.json` y contiene 120 productos en 12 categorías, cada uno con identificador, descripción, precio en centavos, ilustración SVG propia, texto alternativo y metadatos de licencia. La portada permite navegar por categorías, buscar por texto parcial sin distinguir tildes ni mayúsculas, abrir fichas de producto, marcar favoritos y añadir artículos al carrito. El carrito permite cambiar cantidades y calcula subtotales. El checkout incluye validación de entrega, selección de envío, opciones demostrativas de pago y una pantalla de confirmación. El catálogo, carrito, autenticación de demostración y pedido no están conectados a una API: usan `fetch` para el JSON y almacenamiento del navegador (`localStorage`/`sessionStorage`). No hay cuentas compartidas, sincronización entre dispositivos, inventario autoritativo, procesamiento de pagos ni pedidos persistidos en un servidor. Para integrarlo como tienda real se requiere backend y reemplazar los almacenamientos locales por APIs seguras.

## 3. Tecnologías y arquitectura

- **Frontend:** HTML5, CSS3 y JavaScript moderno sin framework.
- **Formato de datos:** JSON estático para el catálogo.
- **Recursos de producto:** ilustraciones SVG locales en `images/products/`.
- **Persistencia del prototipo:** `localStorage` y `sessionStorage` del navegador.
- **Dependencias de ejecución:** no requiere gestor de paquetes ni proceso de compilación.
- **Carga local:** requiere HTTP para que `fetch("data/products.json")` funcione; abrir `index.html` directamente mediante `file://` no es el flujo esperado.
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
| `data/products.json` | Fuente de verdad estática del catálogo de demostración. |
| `images/products/` | Ilustraciones SVG locales para cada producto. |
| `catalogo.js` | Carga y valida el JSON, construye tarjetas y carruseles. |
| `detalle-producto.js` | Muestra detalles del producto seleccionado y recomendaciones. |
| `busqueda.js` | Filtra los productos de acuerdo con la consulta en la URL. |
| `favoritos.js` | Gestiona los botones y la colección de favoritos local. |
| `carrito.js` | Agrega artículos, actualiza cantidades, elimina y renderiza los resúmenes. |
| `entrega-validacion.js` | Valida los campos de entrega y actualiza el total de envío. |
| `pago.js` | Valida los campos de tarjeta de demostración, construye el pedido local y vacía el carrito. |
| `confirmacion.js` | Valida y presenta el pedido guardado en la sesión del navegador. |
| `auth.js` | Registro/inicio/cierre de sesión local de demostración mediante el diálogo de acceso. |
| `generar-ilustraciones.js` | Genera las ilustraciones SVG locales usando el catálogo como entrada. |
| `informe-productos-para-imagenes-ia.md` | Checklist de los 120 nombres de producto, distribuidos en 12 categorías, para producir imágenes. |
| `AUDITORIA.md` | Auditoría de riesgos y limitaciones del prototipo. |
| `flujo-y-criterios.md` | Decisiones de interacción, accesibilidad y flujo de compra. |

## 5. Catálogo y modelo de datos

El archivo `data/products.json` contiene un objeto raíz con `version` y una lista `products`. El catálogo actual contiene 120 artículos: 10 por cada una de estas 12 categorías: fútbol, basketball, tennis, artes marciales, volleyball, ropa deportiva, running, ciclismo, fitness, natación, outdoor y accesorios.

Forma representativa de un producto:

```json
{
  "categoryId": "futbol",
  "categoryLabel": "Fútbol",
  "category": "Fútbol · Balones",
  "name": "Balón Pro Match",
  "description": "Balón de fútbol talla 5 para partidos y entrenamientos.",
  "priceCents": 3490,
  "id": "futbol-balon-pro-match",
  "imageUrl": "images/products/futbol-balon-pro-match.svg",
  "imageAlt": "Balón Pro Match. Balón de fútbol talla 5 para partidos y entrenamientos.",
  "imageCredit": "Apex Sports",
  "imageLicense": "CC BY 4.0",
  "imageLicenseUrl": "https://creativecommons.org/licenses/by/4.0/",
  "imageSourceUrl": "images/products/futbol-balon-pro-match.svg",
  "imageSourceTitle": "Ilustración original Apex Sports"
}
```

### Contrato de campos

- `id`: identificador estable del producto; lo usa la ficha de producto.
- `categoryId`: debe coincidir con el identificador de una sección de categoría presente en `index.html`.
- `categoryLabel` y `category`: nombre de categoría general y clasificación visible del artículo.
- `name` y `description`: texto mostrado y contenido que usa la búsqueda.
- `priceCents`: precio entero en centavos; evita usar números decimales como fuente de cálculo.
- `imageUrl`: ubicación de la ilustración.
- `imageAlt`: nombre y descripción del artículo, pensado para tecnologías de asistencia.
- `imageCredit`, `imageLicense`, `imageLicenseUrl`, `imageSourceUrl`, `imageSourceTitle`: crédito y referencia de licencia/origen.

Al añadir productos, hay que actualizar también la sección correspondiente en `index.html`, generar o incluir el archivo de imagen y mantener sus metadatos coherentes.

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
- La lista se guarda en el almacenamiento local del navegador.
- La sección Favoritos muestra los productos seleccionados y permite quitarlos o agregarlos al carrito.
- Las categorías y la lista de favoritos muestran todos sus productos, sin paginación.
- La cuenta de demostración no sincroniza favoritos con otros navegadores o dispositivos.

### 6.5 Carrito

- El carrito se conserva en `localStorage` bajo la clave `apex-sports-cart`.
- Agregar un producto actualiza el carrito y el contador, sin forzar navegación.
- La vista del carrito permite aumentar o reducir unidades (mínimo uno) y quitar productos.
- Se calculan subtotal y totales usando precios en centavos.
- La región de estado anuncia en español adiciones, cambios y errores a tecnologías de asistencia.

### 6.6 Entrega

- **Continuar con la entrega** desde el carrito requiere una sesión local; al iniciar sesión o crear una cuenta se abre la pantalla de entrega. También se solicita acceso si se abre directamente esa pantalla.
- Se validan nombre, correo, teléfono, dirección y ciudad cuando el campo pierde foco y al enviar.
- Se muestran mensajes y orientación de entrada en español.
- La opción de entrega afecta el costo y total. El envío estándar se calcula en 400 centavos y express en 800 centavos.
- El formulario pasa el tipo de entrega a la página de pago mediante la URL.

### 6.7 Pago y confirmación

- Ofrece opciones demostrativas de tarjeta, transferencia bancaria y pago/retiro en local.
- La opción local no añade costo de envío.
- Los campos de tarjeta se validan en el navegador; no hay proveedor ni solicitud real de cobro.
- Al confirmar, `pago.js` construye un resumen, lo escribe en `sessionStorage` bajo `apex-sports-last-order`, borra el carrito y navega a la pantalla de confirmación.
- `confirmacion.js` comprueba que productos, subtotal, envío y total sean coherentes antes de mostrarlos.
- El pedido solo existe para la demostración en la sesión del navegador; no se registra en un backend.

### 6.8 Cuenta de demostración

- El diálogo permite crear cuenta, iniciar sesión y cerrar sesión en este mismo navegador.
- El mismo diálogo se reutiliza en la tienda, el carrito y la entrega; las acciones de favoritos y la continuación del checkout se reanudan tras autenticar.
- `auth-modal.js` construye el diálogo compartido; `auth.js` gestiona la sesión local y la continuación/cancelación de la acción protegida.
- Los datos se guardan localmente bajo las claves `apex-sports-demo-accounts-v1` y `apex-sports-demo-session-v1`.
- La contraseña se deriva en el cliente mediante PBKDF2; esto no convierte el flujo en autenticación de producción.
- No hay servidor, recuperación de contraseña, cookies de sesión, autorización de recursos, sincronización entre dispositivos ni conexión entre usuarios y favoritos/carrito.
- No usar esta función para cuentas o contraseñas reales. El sistema real requiere backend, hashing configurado en servidor y sesiones seguras.

## 7. Persistencia actual

| Dato | Ubicación | Alcance y duración |
|---|---|---|
| Catálogo | `data/products.json` | Archivo estático compartido por la publicación del sitio. |
| Carrito | `localStorage` (`apex-sports-cart`) | Mismo navegador y origen; persiste tras cerrar la página hasta que se borre o confirme el pedido. |
| Favoritos | `localStorage` (`apex-sports-favoritos-v1`) | Mismo navegador y origen; no está asociado a cuenta. |
| Cuentas de demo | `localStorage` (`apex-sports-demo-accounts-v1`) | Solo en el navegador actual; no constituye almacenamiento seguro de cuentas. |
| Sesión de demo | `localStorage` (`apex-sports-demo-session-v1`) | Estado local hasta cierre explícito o limpieza de almacenamiento. |
| Pedido reciente | `sessionStorage` (`apex-sports-last-order`) | Sesión de la pestaña/origen; no es un registro de pedido de servidor. |
| Datos de tarjeta | No se persisten | Se validan en el cliente como parte de la simulación. |

Cambiar navegador, dispositivo, perfil, origen o limpiar datos del sitio puede separar o eliminar estos datos locales.

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

## 10. Límites y requisitos para una integración real

Este proyecto es un prototipo estático. No ofrece API HTTP de productos, usuarios, favoritos, carrito, inventario, direcciones o pedidos. Tampoco tiene autenticación de servidor, autorización, sincronización multi-dispositivo ni pagos reales.

Una integración de producción debe como mínimo:

1. Definir un backend/API y un almacenamiento persistente.
2. Validar precios, disponibilidad, cantidades, totales y envío en el servidor; el navegador no debe ser autoridad comercial.
3. Implementar autenticación y sesiones protegidas en el servidor; no tratar las cuentas almacenadas en `localStorage` como identidades verificadas.
4. Vincular favoritos/carrito a la identidad del usuario cuando corresponda y definir cómo combinar datos locales al iniciar sesión.
5. Crear pedidos persistentes y estados de pedido en el servidor.
6. Integrar un proveedor de pagos; nunca afirmar que se cobró o validar tarjetas solo con reglas frontend.
7. Revisar privacidad, protección de datos, accesibilidad y seguridad antes de publicación comercial.

## 11. Contexto corto reutilizable

Para pasar una descripción compacta a otra herramienta:

```text
Estoy trabajando en Apex Sports, un prototipo e-commerce deportivo estático en HTML, CSS y JavaScript vanilla. Se ejecuta sin compilación y requiere HTTP para cargar data/products.json. El catálogo contiene 120 productos en 12 categorías; cada producto incluye id, categoryId, category, name, description, priceCents, imageUrl e imageAlt, además de metadatos de licencia. Las ilustraciones son SVG locales en images/products/. La portada incluye búsqueda parcial tolerante a tildes, categorías y carruseles; las tarjetas abren una ficha con selector de cantidad; el carrito y favoritos se guardan localmente; el checkout simula entrega/pago y el pedido de confirmación solo se guarda en sessionStorage. El registro/inicio de sesión también es solo local y no sincroniza con favoritos. No hay backend, inventario real, API, pedidos persistentes ni procesamiento de pagos. Mantén la arquitectura estática del prototipo salvo que se solicite explícitamente una integración backend, no presentes funciones simuladas como reales y conserva etiquetas, nombres accesibles, textos alternativos, regiones aria-live y comportamiento responsive.
```
