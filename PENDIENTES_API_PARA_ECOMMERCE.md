# Cambios pendientes en la API para completar la integración del e-commerce

**Dirigido a:** agente responsable de `API-ApexSports`
**Alcance:** contrato entre la tienda `E-commerce/` y la API FastAPI/PostgreSQL. Este documento pide cambios y verificaciones; no autoriza ejecutar migraciones sobre producción ni modificar datos reales.

## Resumen

La tienda ya contiene un cliente HTTP y consume endpoints de autenticación, catálogo, carrito y checkout. La API implementa esos recursos y persiste usuarios, carrito y pedidos. Sin embargo, la integración aún tiene brechas concretas:

1. El formulario de registro fue reducido a nombre, correo, contraseña, cédula/RUC y ciudad, pero `RegisterRequest` de la API todavía exige teléfono y dirección.
2. El esquema SQL ya incluye `FAVORITOS`, pero no hay endpoints de favoritos; la tienda todavía persiste esa lista en `localStorage`.
3. La configuración de publicación del frontend debe apuntar a la URL HTTPS real de la API; el cliente conserva `http://127.0.0.1:8000/api/v1` como valor por defecto.
4. El checkout conserva dirección/teléfono/ciudad por pedido, como se necesita; asegurar que estos campos nunca actualicen la dirección fija del perfil del cliente.
5. La tienda muestra la confirmación desde `sessionStorage` aunque ya existe un endpoint de consulta de pedidos. Debe recuperar la confirmación desde la API para no tratar el almacenamiento del navegador como registro autoritativo.

## 1. Contrato de registro: reducir campos sin perder datos obligatorios

### Estado observado

- `E-commerce/auth-modal.js` solicita nombre completo, correo, cédula/RUC, ciudad y contraseña. Ya no solicita teléfono ni dirección.
- `E-commerce/auth.js` envía actualmente:

```json
{
  "full_name": "Nombre Apellido",
  "email": "persona@example.com",
  "password": "contraseña",
  "identification": "1234567890",
  "city_id": "UIO"
}
```

- `API-ApexSports/app/schemas.py::RegisterRequest` aún declara `phone` y `address` requeridos. Con esa versión, la solicitud actual falla por validación (`422`) antes de insertar.
- En `Scripts/Script-Creacion-Tablas.sql`, `CLIENTES.cli_Telefono` y `CLIENTES.cli_Direccion` permiten `NULL`. `CLIENTES.cli_Nombre`, `cli_RUC_CED` e `id_Ciudad` sí son `NOT NULL`. `USUARIOS.usr_Telefono` también admite `NULL`.
- El endpoint de registro ya crea `USUARIOS`, `USUARIOSxROLES`, `CLIENTES` y la sesión dentro de una transacción. También genera IDs, calcula el hash de contraseña en servidor, toma el rol cliente desde la DB y usa el email como username.

### Cambio solicitado

Actualizar `RegisterRequest` y `POST /api/v1/auth/register` para que el contrato requerido sea solamente:

- `full_name`
- `email`
- `password`
- `identification`
- `city_id`

No hacer opcionales la identificación ni la ciudad: se acordó mantenerlas requeridas durante el registro porque el esquema de cliente exige esos datos.

Al crear el perfil cliente, completar automáticamente desde los datos verificados de registro:

| Tabla/columna | Valor esperado |
|---|---|
| `USUARIOS.id_Usuario` | ID generado por servidor |
| `USUARIOS.usr_Username` | Email normalizado, según la política actual |
| `USUARIOS.usr_PasswordHash` | Hash Argon2id generado en servidor; nunca aceptar un hash del navegador |
| `USUARIOS.usr_Nombre` / `usr_Apellido` | Separación validada de `full_name` |
| `USUARIOS.usr_Mail` | Email normalizado |
| `USUARIOS.usr_Telefono` | `NULL` al registrarse |
| `USUARIOSxROLES` | Rol cliente activo, escogido sólo por el servidor |
| `CLIENTES.id_Cliente` | ID generado por servidor |
| `CLIENTES.id_Usuario` | ID de la fila `USUARIOS` creada |
| `CLIENTES.cli_Nombre` | `full_name` validado |
| `CLIENTES.cli_Mail` | Email normalizado |
| `CLIENTES.cli_RUC_CED` | `identification` validada |
| `CLIENTES.id_Ciudad` | `city_id` validado contra `CIUDADES` |
| `CLIENTES.cli_Telefono` / `cli_Direccion` | `NULL` al registrarse; son datos variables/no requeridos por el DDL |

Conservar los inserts de usuario, rol, cliente y sesión en una única transacción. Ante duplicidad, devolver conflicto y no dejar filas parciales. Mantener el rechazo de campos inesperados/`role` para que el cliente no pueda asignarse privilegios.

### Compatibilidad de despliegue

El frontend ya usa el contrato reducido; por ello, el despliegue de esta versión del frontend depende de que la API tenga desplegado el cambio. Añadir/actualizar pruebas de esquema y del endpoint para demostrar que:

1. El payload anterior crea las filas esperadas de usuario, rol, cliente y sesión.
2. No es necesario enviar `phone` ni `address`.
3. Los campos opcionales del cliente quedan nulos y la transacción completa no los inventa.
4. Falta de identificación/ciudad, ciudad inexistente, credenciales repetidas y rol cliente no provisionado producen error explícito y no dejan registros parciales.
5. La contraseña persistida es hash y no aparece en respuestas/logs.

Si la instancia desplegada usa la versión antigua del esquema Pydantic, publicar backend antes de promover el nuevo frontend para que no se rompa el registro.

## 2. Dirección y datos de entrega por pedido, no por perfil

### Decisión de producto

El cliente puede entregar en casa, trabajo u otro lugar. La dirección/city/phone del checkout pertenecen a **ese pedido**, no a una dirección fija del perfil. El checkout solicita ahora teléfono, dirección, ciudad y referencia para cada pedido; la interfaz explica que esa información no cambia la cuenta.

### Contrato que la tienda envía

`POST /api/v1/checkout` recibe los datos por pedido:

```json
{
  "delivery_address": "Dirección elegida para esta compra",
  "delivery_city": "Ciudad de entrega",
  "delivery_phone": "Teléfono de contacto para esta entrega",
  "delivery_reference": "Referencia opcional",
  "delivery_method": "estandar",
  "payment_method": "demo"
}
```

La migración `001_api_sessions_catalog_orders.sql` ya tiene columnas `delivery_address`, `delivery_city`, `delivery_phone`, `delivery_reference` y `delivery_method` en `apex_orders`. `checkout.py` las escribe como snapshot inmutable de la orden y no debería copiar esos valores a `CLIENTES.cli_Direccion`, `cli_Telefono` ni `CLIENTES.id_Ciudad`.

### Verificaciones/correcciones solicitadas

- Añadir una prueba de integración que cree dos pedidos de un mismo cliente con direcciones/ciudades distintas y confirme que cada pedido conserva su propia dirección, teléfono y referencia.
- Confirmar en `GET /api/v1/orders/{id}` que se devuelve el snapshot exacto de ese pedido.
- Asegurar aislamiento por propietario: un cliente no puede leer ni cancelar una orden ajena.
- No llenar la dirección de entrega a partir de `CLIENTES.cli_Direccion` ni guardar la dirección del pedido como actualización de perfil.
- Si el negocio exige guardar una dirección favorita/libreta de direcciones, diseñar recurso y tabla aparte. No reutilizar `CLIENTES.cli_Direccion` como si fuera el destino permanente de todos los pedidos.
- Si se requiere editar datos de perfil, exponer un endpoint de perfil aparte y sólo modificar esos campos cuando el usuario guarde el perfil explícitamente.

## 3. Favoritos sincronizados con la tabla `FAVORITOS`

### Estado observado

- `Scripts/Script-Creacion-Tablas.sql` incluye `FAVORITOS` con PK compuesta `(id_Usuario, id_Producto)`, fecha por defecto y FKs hacia `USUARIOS` y `PRODUCTOS`.
- La tabla tiene clave de producto SQL `CHAR(10)`, mientras el storefront opera con slugs públicos (por ejemplo, `futbol-balon-pro-match`) guardados en `apex_product_catalog`.
- `API-ApexSports/app/main.py` no monta router de favoritos y no hay rutas de favoritos en OpenAPI.
- `E-commerce/favoritos.js` mantiene los IDs en `localStorage`; iniciar sesión no sincroniza ni carga favoritos del servidor.

### Implementación solicitada

Crear endpoints autenticados con el usuario derivado exclusivamente del token vigente; nunca aceptar `user_id` en el body:

- `GET /api/v1/favorites`: lista de favoritos del usuario autenticado, representando cada producto con su slug público canónico y la metadata necesaria para renderizarlo.
- `PUT /api/v1/favorites/{product_slug}` (o un `POST` idempotente equivalente): agrega el producto; duplicar la misma operación no debe crear duplicados.
- `DELETE /api/v1/favorites/{product_slug}`: quita sólo el favorito de ese usuario y debe tener un resultado consistente si ya no existía.

Resolver el slug mediante `apex_product_catalog` y persistir `product_id` relacional en `FAVORITOS`; nunca intentar truncar/incluir un slug en `CHAR(10)`. Validar que el producto siga siendo válido/visible; devolver códigos claros para sesión ausente, producto no encontrado y conflicto. Restringir consultas y mutaciones al principal autenticado.

Preparar migración idempotente/versionada para la base ya existente si la tabla aún no fue creada. El hecho de que `CREATE TABLE FAVORITOS` aparezca en el script inicial no garantiza que exista en una instancia ya migrada; comprobar esquema objetivo de forma segura, sin volver a ejecutar todo el script base.

Añadir pruebas:

1. GET sin token devuelve `401`.
2. Agregar favorito y volver a listar devuelve exactamente el producto agregado.
3. Eliminar devuelve la colección actualizada; la operación repetida tiene comportamiento documentado.
4. Usuario A no puede leer, agregar ni quitar favoritos de usuario B.
5. El mapping usa la PK DB por slug y no trunca el slug.

La capa frontend correspondiente deberá reemplazar `localStorage` por estas rutas, hidratar botones/contador/lista desde API tras validar la sesión, y sincronizar el favorito tras login. Reportar errores de red/API sin escribir una copia local que aparenta persistencia compartida.

## 4. Configuración de URL pública y CORS

- `E-commerce/api-client.js` usa `http://127.0.0.1:8000/api/v1` si no existe `window.APEX_API_BASE`.
- GitHub Pages no puede usar la dirección local del equipo del usuario. Definir `APEX_API_BASE` como URL HTTPS de la API en una configuración pública no secreta cargada antes de `api-client.js`.
- Mantener `DATABASE_URL` sólo en el entorno del servidor. No incluir credenciales/token en config JavaScript, GitHub Pages ni Markdown.
- Comprobar `CORS_ORIGINS` con el origen exacto del sitio y probar `OPTIONS`, login, catálogo y checkout desde el navegador publicado.
- `/health/live` verifica proceso; `/health/ready` ejecuta `SELECT 1`. No confundir liveness con conexión real a DB.

## 5. Qué ya existe y debe conservarse

- `GET /health/live` y `/health/ready`.
- `POST /auth/register`, `/auth/login`, `GET /auth/me`, `DELETE /auth/session` y sesiones opacas/revocables.
- Catálogo DB: `GET /products`, `/products/{slug}`, `/products/categories`, `/products/cities`.
- Carrito autenticado: `GET /cart`, `PUT /cart/items`, `DELETE /cart/items/{slug}`; validar con pruebas que GET/PUT/DELETE reflejen en PostgreSQL, se apliquen stock y límites y el merge de invitado sea seguro.
- Checkout autenticado: `POST /checkout` con `Idempotency-Key`, consulta/listado/cancelación de órdenes; conserva precio e inventario autoritativos del servidor y no cobra.
- Checkout registra un snapshot de destino por pedido y reserva inventario dentro de una transacción.
- Pago actual es intencionalmente de demostración (`payment_method="demo"`, estado `NOT_PROCESSED`); no introducir campos ni persistencia de PAN/CVV.

## 6. Alineación restante entre UI y API

### Confirmación e historial

`pago.js` recibe una respuesta persistida por API, pero copia la orden en `sessionStorage`; `confirmacion.js` la presenta sólo desde ese almacenamiento. La API ya tiene `GET /api/v1/orders/{id}` y listado del usuario. Ajustar el frontend para recuperar la confirmación desde ese recurso, verificar que el token pertenezca a la sesión y manejar URL inválida/orden expirada/401 sin mostrar una confirmación fabricada. Considerar historial de pedidos para que la persistencia sea útil entre sesiones/dispositivos.

### Contrato del catálogo

El storefront pagina `GET /api/v1/products` y valida `items`, `total`, `id`, `categoryId`, `categoryLabel`, `name`, `description`, `priceCents` e `imageUrl`. Mantener estable ese shape, paginación y slugs. La tienda deriva actualmente `imageAlt` de nombre/descripción; si DB/API incorpora alt text, definir el campo explícito y validarlo.

### Carrito de invitado y sincronizado

El frontend permite carrito de invitado en almacenamiento local y al autenticar intenta mapear productos por ID/nombre y fusionarlos con `/cart`. Preservar el ID canónico y probar duplicados, stock agotado, cantidades >99, error de red a mitad del merge y cambio de cuenta con sincronización pendiente. La API no debe aceptar precios/subtotales del browser como valores autoritativos.

### Entrega y pagos

- La entrega usa destino por pedido y valida en frontend; volver a abrir el paso no debe sustituir datos del perfil.
- La API registra costo de envío cero porque no hay tarifa fiscal/comercial acordada. El frontend debe seguir mostrándolo como no configurado; no presentar una tarifa distinta de la almacenada.
- La única opción operativa de pago es demostración. Mantener orden pendiente/no pagada hasta que exista una pasarela y flujo de confirmación de pago.

## 7. Entregables esperados del agente API

1. Cambio de `RegisterRequest`/`POST /auth/register` compatible con el registro reducido y prueba de transacción completa.
2. Endpoints autenticados CRUD mínimo de favoritos, ligados a `FAVORITOS` y a mapping slug → PK real.
3. Pruebas que demuestren que el destino de cada orden es independiente del perfil del cliente.
4. OpenAPI/README actualizados con payload, respuesta, errores, seguridad y migration steps.
5. Confirmación de si la tabla FAVORITOS existe en la base objetivo y migración versionada segura si falta.
6. Smoke tests contra el despliegue: health readiness, registro, login/me, catálogo, carrito, favoritos, checkout y lectura de orden; sin exponer datos personales ni secretos en logs o respuesta.
7. Lista clara de rutas que siguen siendo demo/no implementadas, especialmente pago, recuperación de contraseña, libreta de direcciones y modificación de perfil.

## Fuentes de contrato revisadas

- `API-ApexSports/app/schemas.py`
- `API-ApexSports/app/routers/auth.py`
- `API-ApexSports/app/routers/cart.py`
- `API-ApexSports/app/routers/checkout.py`
- `API-ApexSports/app/main.py`
- `API-ApexSports/migrations/001_api_sessions_catalog_orders.sql`
- `API-ApexSports/README.md`
- `Scripts/Script-Creacion-Tablas.sql`
- `Scripts/Script-Constrains-Tablas.sql`
- `E-commerce/api-client.js`, `auth.js`, `auth-modal.js`, `catalogo.js`, `carrito.js`, `favoritos.js`, `entrega-validacion.js`, `pago.js` y `confirmacion.js`
