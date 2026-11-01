# Informe de alineación entre interfaces, API y base de datos

**Alcance:** comparación de la interfaz actual del e-commerce, su modelo JSON y documentación técnica con los documentos de alineación, administración, guía de API y scripts SQL entregados.  
**Objetivo:** identificar qué datos y operaciones pueden mapearse directamente, qué no coincide y qué debe definirse antes de conectar la interfaz con PostgreSQL/Supabase.

## 1. Conclusión ejecutiva

**La interfaz no está actualmente conectada ni alineada operacionalmente con la base de datos.** El e-commerce es una demostración que carga un catálogo JSON y mantiene carrito, favoritos, cuenta y pedido en el navegador. La guía de API propone FastAPI y consultas SQL, pero no define contratos completos para las pantallas ni hay evidencia de una API desplegada o conectada.

Las entidades del SQL sí dan una base para catálogo, usuario, cliente, carrito, compras, facturas, entregas e inventario. Aun así, los modelos no tienen correspondencia directa en campos e identificadores. En particular:

1. Los IDs de producto usados por JSON y carrito no corresponden a `PRODUCTOS.id_Producto CHAR(10)`.
2. Los IDs públicos de categorías necesitan mapearse a las claves de `CATEGORIAS`.
3. La cuenta frontend no reúne los campos que exige `USUARIOS` y no crea un perfil `CLIENTES`.
4. El formulario de entrega recoge información que no se envía ni se persiste; `CLIENTES` y `ENTREGAS` no representan toda la dirección y el costo elegido.
5. El flujo de pago confirma en el navegador, mientras el SQL no separa explícitamente pedido, pago y factura.
6. El contrato de producto de la API depende de una vista cuyo DDL y salida no están entre los documentos recibidos.
7. El panel administrativo también es ficticio y no consume API ni persiste cambios.

**No se puede confirmar si los 120 productos de `data/products.json` existen en la base real.** No se proporcionaron datos semilla/exportación del catálogo ni definición de la vista. Este informe compara las estructuras y el comportamiento descritos, no consulta la instancia Supabase.

## 2. Estado por componente

| Componente | Estado actual descrito | Alineación con SQL/API |
|---|---|---|
| Catálogo público | 120 registros en `data/products.json`, imágenes SVG y precios en centavos. | Parcial en concepto; IDs, categorías, moneda y campos no tienen contrato de mapeo. No se validó que existan las mismas filas en PostgreSQL. |
| Detalle de producto | Se consulta desde el JSON ya cargado y abre por slug. | Requiere que API exponga el identificador canónico y sus campos de detalle. |
| Carrito | `localStorage`; el precio y nombre se guardan en el navegador. | No coincide con el carrito SQL por cuenta ni usa FK válidas de producto. |
| Favoritos | `localStorage`, sin relación a una cuenta ni tabla SQL. | No sincronizable entre dispositivos; no hay entidad en el esquema. |
| Registro/login | Cuenta de demostración en `localStorage`; derivación local de contraseña. | No es autenticación de servidor. La forma del usuario no cubre los campos requeridos de SQL. |
| Entrega | Campos validados en navegador y costos estándar/express codificados en frontend. | Los datos no se envían; la base no conserva una instantánea completa de entrega ni costo/modalidad. |
| Pago/pedido | Selección y validación de demostración; pedido guardado en `sessionStorage`. | No crea filas en la base; `FACTURAS` no representa claramente estados de pedido/pago pendientes. |
| Panel administrativo | Datos estáticos y formularios de demostración, sin persistencia. | Entidades relacionadas existen, pero no hay conexión, contratos ni autorización implementados. |
| API REST | Guía y ejemplo FastAPI; rutas parciales sugeridas. | No constituye una API implementada; faltan contratos y recursos para varios flujos visibles. |

## 3. Hallazgos sobre el catálogo y los productos

### 3.1 Identificadores incompatibles — bloqueante

- En `data/products.json`, el identificador es un slug legible, por ejemplo `futbol-balon-pro-match`.
- El SQL define `PRODUCTOS.id_Producto CHAR(10)`.
- El carrito actual crea otro ID a partir de la categoría y el nombre, por ejemplo `Fútbol · Balones|Balón Pro Match`, en vez de conservar `product.id`.
- `DETALLE_CARRITO`, `PROxFAC` y otros detalles esperan el ID de producto de diez caracteres como FK.

Por lo tanto, el ID del JSON no se puede insertar como FK ni recuperar de forma fiable a partir del ID artificial del carrito.

**Qué modificar/decidir:**

1. Elegir un ID canónico para toda la aplicación.
2. Preferiblemente ampliar/migrar `PRODUCTOS.id_Producto` y todas sus FK a `VARCHAR` suficiente o UUID. Si se conserva el ID corto de la base, exponerlo siempre como `id` público y mantener el slug en una columna separada y única.
3. Cambiar tarjetas y detalle para usar el ID canónico de la API; `carrito.js` debe enviar `{ productId, quantity }`, no reconstruir identidad con texto.
4. No truncar slugs ni usar el nombre visible como clave.

### 3.2 IDs y clasificación de categorías requieren una tabla de mapeo

El catálogo usa `categoryId` como `futbol`, `basketball`, `tennis`, `mma`, `ropa`, etc. La navegación del HTML también tiene sus propias anclas. La base define `CATEGORIAS.id_Categoria CHAR(10)` y `cat_Nombre`, pero no se entregaron datos semilla que demuestren que sus IDs coinciden con los del frontend.

Además, el catálogo distingue una categoría deportiva (`categoryLabel`) y un texto más específico (`category`, por ejemplo «Fútbol · Balones»). El esquema solo muestra una relación de producto con una categoría; no define explícitamente esa clasificación secundaria.

**Qué modificar/decidir:**

- Crear y documentar un mapeo estable `categoryId público → id_Categoria DB → nombre visible`.
- Decidir si «Balones», «Entrenamiento» u otros textos son subcategorías; si lo son, modelarlas, no inferirlas desde una cadena libre.
- El API debe devolver ambos valores separados y con nombre contractual (`categoryId`, `categoryName`, `subcategoryName`, si aplica).

### 3.3 Campos del catálogo y base no son equivalentes

El JSON incluye `name`, `description`, `priceCents`, `imageUrl`, `imageAlt` y metadatos de licencia. `PRODUCTOS` incluye nombre, descripción corta, material, talla, color, garantía, costo, precio de venta, stock y relaciones obligatorias a percha, categoría, marca y unidades. `PRODUCTO_FOTOGRAFIAS` contiene URL y orden, pero no texto alternativo ni licencia.

No es una correspondencia 1:1: JSON carece de campos administrativos obligatorios y el SQL no muestra campos para los metadatos de imagen del frontend.

**Qué modificar/decidir:**

- Definir DTO de catálogo de lectura con campos de venta, separados del modelo interno de inventario.
- Mapear `pro_Nombre → name`, `pro_DescripcionCorta → description` y foto activa → `imageUrl`.
- Acordar si `imageAlt` se genera en API desde nombre/descripción o se persiste como metadata de la fotografía.
- Definir si licencia/crédito son sólo metadata del asset o deben persistirse en el modelo.
- Para alta/edición administrativa, obtener categoría, marca, percha y unidades desde catálogos; no inventar valores para satisfacer los `NOT NULL`.

### 3.4 Precio y moneda

- El frontend usa centavos enteros: `priceCents: 3490` representa `$34,90`.
- SQL usa `NUMERIC(7,2)` en `pro_Precio_Venta` y otras columnas monetarias.
- El documento SQL no incluye columna de moneda.
- El checkout muestra envío de `$4,00`/`$8,00`, pero son constantes del frontend; la base no tiene campo de costo/modalidad de envío.
- `FACTURAS` exige subtotal, IVA y total. El checkout actual muestra subtotal, envío y total, pero no presenta ni calcula IVA explícitamente.

**Qué modificar/decidir:**

- Declarar moneda única (por ejemplo USD) en el contrato de API o agregarla al modelo si se prevén varias.
- Definir un solo formato de interfaz API para dinero: centavos enteros o decimal exacto como cadena. Mantener cálculos exactos; nunca usar `float`.
- Definir si el precio mostrado incluye IVA y cuál es la regla fiscal antes de mapear el total del checkout a `fac_Subtotal`, `fac_IVA` y `fac_Total`.
- La API debe calcular subtotal, impuesto, descuento, envío y total con datos de DB/configuración del servidor; no aceptar esos valores desde el navegador.

## 4. Cuenta, cliente y autenticación

### 4.1 Registro no cubre el modelo SQL — bloqueante

El formulario actual solicita nombre completo, correo y contraseña. `USUARIOS` requiere `usr_Username`, `usr_PasswordHash`, `usr_Nombre`, `usr_Apellido` y `usr_Mail`. `usr_Username` es obligatorio y único, pero no se solicita en el registro frontend. El nombre completo requiere una política explícita para separar nombre/apellido o, mejor, campos separados.

Para comprar, `CLIENTES` exige `cli_Nombre`, `cli_RUC_CED` y `id_Ciudad`; `id_Usuario` puede relacionarlo con la cuenta. El registro no solicita identificación ni ciudad. No debe inferirse la identificación o ciudad desde otros campos.

**Qué modificar/decidir:**

- Definir qué información se pide al registrarse y qué puede completarse en perfil/checkout.
- Decidir si username seguirá siendo obligatorio; si no, modificar el esquema y constraint.
- Diseñar el alta de usuario y cliente en una sola transacción cuando los datos de cliente estén disponibles.
- La API asigna el rol público de cliente; el navegador no envía ni decide `id_Rol`.
- Alinear longitud/normalización de email, username, teléfono y nombres. El email SQL tiene 60 caracteres; teléfono `CHAR(10)`, mientras la interfaz acepta de 7 a 15 dígitos.

### 4.2 Autenticación de demostración no es login persistente

`auth.js` guarda las cuentas, sesión y un hash derivado en `localStorage`. No llama a endpoint, no crea fila de `USUARIOS`, no valida roles con servidor y no autentica al panel. La derivación PBKDF2 ejecutada por el navegador no sustituye el hash de contraseña y gestión de sesión del backend.

La guía API incluye routers de productos, carrito, compras y ventas, pero no define router de autenticación; la documentación administrativa propone `/api/v1/auth/me` como necesidad futura.

**Qué modificar:**

- Implementar endpoints de registro, login, logout, sesión actual/perfil y expiración.
- Usar cookies de sesión seguras o documentar una alternativa segura compatible con los dominios. No usar `localStorage` como depósito de tokens largos.
- Separar registro público de aprovisionamiento de administradores y aplicar autorización en cada endpoint.
- La configuración de ejemplo de CORS usa `allow_origins=["*"]` junto con `allow_credentials=True`; reemplazar por orígenes permitidos explícitos de tienda y panel.

## 5. Carrito y favoritos

### 5.1 Carrito

La tabla `CARRITO` está ligada obligatoriamente a `USUARIOS` y `uk_carrito_usuario` limita a un carrito por usuario. El frontend permite crear carrito como invitado y lo conserva en `localStorage`. No hay regla documentada de fusión cuando el usuario inicia sesión.

`DETALLE_CARRITO` contiene cantidad y precio unitario, pero el precio almacenado en el navegador no puede ser autoritativo. El SQL tampoco muestra `UNIQUE(id_Carrito, id_Producto)` ni `CHECK(dtc_Cantidad > 0)`.

**Qué modificar/decidir:**

- Definir si se exige login para carrito o se permite modo invitado; si se permite, establecer identificación temporal y fusión al autenticar.
- Documentar conflicto/duplicados y límites de cantidad/stock durante la fusión.
- Enviar a API sólo ID canónico y cantidad; servidor consulta precio y existencia.
- Añadir unicidad por producto dentro del carrito y checks de cantidades/precios.
- Generar IDs y timestamps en servidor/DB; actualmente `car_FechaCreacion` y `car_FechaUltimaModif` son NOT NULL sin defaults visibles.

### 5.2 Favoritos

La interfaz guarda favoritos localmente y la DB no tiene tabla de favoritos. El esquema actual no puede cumplir una promesa de favoritos persistentes entre navegadores/dispositivos.

**Qué modificar/decidir:**

- Si deben sincronizarse, agregar tabla `FAVORITOS` con FK de usuario/producto, unicidad `(id_Usuario, id_Producto)` y fecha de creación, más endpoints protegidos.
- Si no se requieren sincronizados, conservar almacenamiento local y presentar claramente esa limitación.

## 6. Entrega, pedido, factura y pago

### 6.1 Datos de entrega no llegan al servidor

`entrega.html` recoge nombre, correo, teléfono, dirección, ciudad y referencia, pero los campos no tienen `name` y el formulario sólo valida en cliente. El único dato transmitido por la URL es la opción de entrega seleccionada. No se crea perfil/entrega y no se conserva una copia de los datos ingresados.

`CLIENTES` tiene una sola dirección (`cli_Direccion CHAR(60)`) y ciudad ID; no hay campo para referencia. `ENTREGAS` tiene descripción, fecha/hora, número de productos y estado, pero no una dirección de entrega completa, ciudad, destinatario, modalidad ni costo. Si una dirección de cliente cambia después, tampoco existe una instantánea histórica por pedido.

**Qué modificar/decidir:**

- Modelar una dirección o snapshot inmutable de destinatario, teléfono, calle, referencia y ciudad por pedido/entrega.
- Reemplazar ciudad de texto libre por selección de `CIUDADES.id_Ciudad` obtenido desde API, o permitir texto solo si el esquema lo admite explícitamente.
- Definir longitudes reales de dirección y teléfono y soportar el formato usado por la interfaz.
- Persistir modalidad, costo y fecha estimada de entrega; no codificar tarifa comercial sólo en JavaScript.

### 6.2 `FACTURAS` no tiene ciclo de vida de pedido y pago claro — bloqueante

`pago.js` guarda un objeto local en `sessionStorage` y borra el carrito. `confirmacion.js` presenta ese objeto; no hay inserción SQL. El pedido en frontend usa ID temporal `CN-${Date.now()}` y detalles cuyo `id` se construyó con categoría y nombre, no el PK SQL.

`FACTURAS.ESTADO_FAC` tiene default `PAG`; no distingue por sí solo pedido pendiente, pago pendiente/fallido, confirmado, cancelado o reembolsado. `fac_FormaPago` es texto libre `VARCHAR(20)`. `FACTURAS.id_Usuario` es obligatorio y tiene FK a `USUARIOS`, pero no está definido si representa operador, cliente o actor del sistema. El cliente ya tiene relación separada `CLIENTES.id_Usuario`.

**Qué modificar/decidir:**

- Preferir entidades separadas `PEDIDOS`, detalle de pedido, `PAGOS` y `ENTREGAS`, o documentar explícitamente si `FACTURAS` también representa pedido.
- Acordar estados y transiciones para orden, pago y entrega.
- Definir actor en factura/venta online: empleado, cliente o sistema; evitar asignar la identidad equivocada a `id_Usuario`.
- Al crear pedido, validar carrito, precio, stock, impuestos y envío en una transacción; implementar idempotencia para reintentos.
- Devolver ID/estado del pedido persistido desde API. Sólo después de éxito mostrar confirmación; la página consulta pedido autorizado por el usuario.
- Mantener pagos claramente simulados hasta integrar proveedor. No enviar PAN/CVV a la API propia ni guardar datos financieros.

## 7. Alineación del panel administrativo

La descripción técnica del panel confirma que `app.js` contiene datos ficticios; no existe cliente HTTP ni CRUD persistente. El SQL cubre entidades para catálogo, inventario, compras, proveedores, recepciones, ventas, clientes, usuarios y auditoría, pero su presencia no significa que la interfaz ya opere con esas tablas.

| Interfaz administrativa | Soporte SQL identificado | Pendiente principal |
|---|---|---|
| Productos | `PRODUCTOS`, `CATEGORIAS`, `MARCAS`, `PERCHAS`, `UNIDADES_MEDIDAS`, `PRODUCTO_FOTOGRAFIAS` | El formulario debe representar todos los campos NOT NULL y catálogos FK. |
| Inventario/alertas | Saldos en `PRODUCTOS`, ajustes y sus detalles | No hay stock mínimo ni libro de movimientos unificado/definido; validar stock negativo y transacciones. |
| Compras/recepciones | `COMPRAS`, `PROxOC`, `RECEPCIONES`, `PROxREC` | Asegurar que lo recibido pertenece a una línea comprada y soportar recepciones parciales. |
| Ventas/facturas | `FACTURAS`, `PROxFAC`, `CLIENTES` | Resolver semántica y estados de pedido/pago/factura; mapear etiquetas visibles a códigos. |
| Entregas | `ENTREGAS`, `PROxENT` | El modelo no representa snapshot de destino, tarifa ni método de entrega. |
| Usuarios/roles/permisos | `USUARIOS`, `ROLES`, `PERMISOS`, tablas de unión | Faltan autenticación, seeds iniciales y autorización efectiva por endpoint. |
| Auditoría | `LOG_AUDITORIA` | El script declara explícitamente que no tiene PK ni FK; no puede servir de log robusto sin corregirlo. |

Cada acción del panel debe reflejar éxito sólo tras respuesta confirmada del servidor. Búsqueda, badges, dashboards y auditoría no pueden seguir usando arreglos de demostración al operar con datos reales.

## 8. Problemas de esquema SQL que afectan la integración

Los scripts declaran PK/FK/UNIQUE, pero casi no definen `CHECK` para precios, cantidades, descuentos, estados o saldos. También:

- Varias claves son `CHAR(n)` y muchas PK no tienen secuencia/default; se debe definir generación segura. `CHAR` añade semántica de relleno que complica serialización y comparación.
- `LOG_AUDITORIA` queda sin PK/FK según el script de constraints.
- `DETALLE_CARRITO` no impide duplicados del mismo producto y no restringe cantidades positivas.
- Los detalles de recepciones/entregas tienen FK separadas a documento y producto, pero no prueban que el producto pertenezca a la compra/venta referida.
- `TIMESTAMP` no incluye zona horaria en las columnas visibles.
- `usr_TokenRecuperacion` se modela como texto, sin expiración/consumo visibles; los tokens deben ser de un solo uso, expirar y no almacenarse en claro.
- `CATEGORIAS`, marcas, estados y ciudades no incluyen datos semilla en las fuentes recibidas.
- `pro_Saldo_Final` y otros contadores pueden quedar incoherentes si se actualizan por varias rutas; definir si el saldo se calcula desde movimientos o se mantiene transaccionalmente.

Antes de migrar una base existente, deben prepararse migraciones versionadas, respaldo y verificación de datos; no basta con editar scripts de creación.

## 9. Inconsistencias y vacíos de la guía API

La guía REST propone FastAPI, Supabase/PostgreSQL y `GET /api/v1/products`, carrito, compras y ventas, pero aún es una guía, no una implementación ni un contrato OpenAPI completo.

1. El ejemplo de productos consulta `VW_PRODUCTOS_INVENTARIO`, pero su DDL no fue incluido; no es posible verificar nombres, alias, estado ni columnas.
2. El ejemplo filtra por `Estado = 'ACT'`, mientras el SQL visible define `ESTADO_PROD`; sólo sería correcto si la vista realmente define ese alias.
3. El envoltorio `{status, count, data}` no define el shape de cada producto ni mapea `id_Producto`, `pro_Precio_Venta`, categoría, fotografía y `priceCents`.
4. Los routers incluidos no contemplan `/auth`, perfil de usuario/cliente, `/favorites`, entregas, dashboard, roles/permisos ni auditoría; varios son necesarios para las interfaces descritas.
5. No se especifica cómo se resuelven paginación, búsqueda, errores de validación, autorización, conflictos de stock, sesión expirada, idempotencia o límites de tasa.
6. `allow_origins=["*"]` junto con `allow_credentials=True` debe sustituirse por una allowlist concreta de dominios.
7. La configuración de conexión usa `DATABASE_URL` sin especificar comportamiento de error cuando falta; debe validar configuración al arrancar y mantener secretos sólo en variables del servidor.

## 10. Contrato compartido recomendado

Antes de integrar, publicar un OpenAPI como fuente común para ambos frontends con al menos:

### Producto de venta (ejemplo conceptual)

```json
{
  "id": "ID_CANONICO_DB",
  "slug": "futbol-balon-pro-match",
  "name": "Balón Pro Match",
  "description": "Balón de fútbol talla 5 para partidos y entrenamientos.",
  "category": {
    "id": "ID_CATEGORIA_DB",
    "slug": "futbol",
    "name": "Fútbol"
  },
  "priceCents": 3490,
  "currency": "USD",
  "stockAvailable": 12,
  "images": [
    {
      "url": "https://...",
      "alt": "Balón Pro Match. Balón de fútbol talla 5 para partidos y entrenamientos.",
      "position": 1
    }
  ]
}
```

Los valores anteriores ilustran el contrato; no afirman que existan esos IDs ni stock real en la base.

También especificar:

- Cuenta: campos de registro/login, separación de nombre/apellido, perfil cliente, normalización, estado y rol.
- Carrito: ID canónico y cantidad; precios y totales de sólo lectura calculados por servidor.
- Pedido: líneas, snapshot de dirección, ciudad, método/costo de entrega, subtotal, IVA, descuento, total, moneda y estados.
- Pago: método, estado, referencia no sensible y eventos; sin datos de tarjeta.
- Catálogo: categoría, marcas, imágenes/alt, stock público y estado visible.
- Administración: estados DB ↔ etiquetas UI, permisos por operación y transiciones.
- Errores estandarizados para validación, no autenticado, no autorizado, no encontrado, conflicto de stock y error servidor.

## 11. Plan recomendado por fases

### Fase 0 — Decisiones de dominio antes de programar

1. Resolver IDs de producto/categoría y confirmar datos semilla reales.
2. Definir moneda, IVA incluido/excluido, representación de precio y tarifas de entrega.
3. Decidir qué campos son obligatorios en registro y cuáles en checkout.
4. Acordar ciclo de pedido, pago y factura y significado de `FACTURAS.id_Usuario`.
5. Definir si se permiten carritos invitados y cómo se fusionan; decidir sincronización de favoritos.

### Fase 1 — Esquema y datos

1. Crear migraciones para IDs, checks, estados, auditoría, mínimos/movimientos y modelo de pedido/envío/pago según las decisiones.
2. Agregar semillas de categorías, marcas, unidades, perchas, ciudades y roles/permisos; asignar claves estables.
3. Cargar el catálogo actual y comparar automáticamente cada producto/categoría con la tabla de DB; informar faltantes y duplicados.
4. Definir transacciones e invariantes de inventario, carrito y compra.

### Fase 2 — API y contrato

1. Documentar OpenAPI versionado, esquemas Pydantic y mapping de DB → DTO público/administrativo.
2. Implementar autenticación, perfil, catálogo, carrito, favoritos (si aplica), checkout/pedido, pago y entrega; además endpoints administrativos.
3. Configurar CORS allowlist, secrets, cookies/sesiones y autorización servidor.
4. Probar errores, concurrencia de stock, idempotencia y límites de acceso.

### Fase 3 — Frontends

1. Crear una capa de servicios HTTP que maneje sesión, errores, carga y reintentos.
2. Sustituir `products.json`, `localStorage` de carrito/favoritos/cuenta y `sessionStorage` de pedido por API.
3. Mantener JSON como fixture de desarrollo, no fallback silencioso de producción.
4. Conectar administración y quitar datos de muestra; confirmar cada operación sólo con respuesta exitosa.
5. Probar tienda y panel contra el mismo entorno de pruebas y verificar cada flujo de extremo a extremo.

## 12. Fuentes revisadas y limitaciones

- [Documento de alineación interfaz/base de datos](../API-ApexSports/ALINEACION-INTERFACES-BASE-DE-DATOS.md)
- [Script de creación de tablas](../Scripts/Script-Creacion-Tablas.sql)
- [Script de constraints](../Scripts/Script-Constrains-Tablas.sql)
- [Descripción técnica de administración](../Scripts/DESCRIPCION_TECNICA_ADMINISTRACION.md)
- [Guía de desarrollo/despliegue de API](../Scripts/gu_a_de_desarrollo_y_despliegue_de_api_rest.md)
- [Descripción técnica del e-commerce](./DESCRIPCION_TECNICA_ECOMMERCE.md)
- [JSON actual del catálogo](./data/products.json)
- Interfaz de e-commerce: `index.html`, `carrito.js`, `favoritos.js`, `auth.js`, `entrega.html`, `pago.js` y `confirmacion.js`.

No se recibieron DDL de vistas, migraciones, datos semilla, código ejecutable de FastAPI, respuesta real de endpoints ni dump/consulta de Supabase. Por eso se identifican incompatibilidades del modelo y contratos propuestos, pero no se certifica el estado físico de una instancia de base de datos.
