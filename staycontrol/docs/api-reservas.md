# API de reservas

Base: `/api/v1/reservas`. Requiere sesión ADMIN y CSRF para escrituras, igual que
[habitaciones](api-habitaciones.md). La vista de reservas todavía usa datos de ejemplo.

| Método | Ruta | Resultado |
| --- | --- | --- |
| GET | `/` | Listado paginado: `items`, `pagina`, `tamano`, `total` |
| GET | `/{id}` | Consulta individual; `404` si no existe |
| POST | `/` | Creación `201`; exige `Idempotency-Key` |
| PUT | `/{id}/estado` | Cancelar o finalizar, `200` |
| DELETE | `/{id}` | Cancelación lógica, `204`; nunca borra el historial |

El listado admite `estado=CONFIRMADA`, `CANCELADA` o `FINALIZADA`, `habitacionId`,
`pagina` (0–10000) y `tamano` (1–100, por defecto 20). Se ordena por fecha de entrada
e id. La página y su total son lecturas separadas, no una instantánea conjunta.

## Crear

```json
{
  "habitacionId": "<id de 64 caracteres devuelto por habitaciones>",
  "huesped": "María Pérez",
  "personas": 2,
  "fechaEntrada": "2026-12-10",
  "fechaSalida": "2026-12-12"
}
```

Todos los campos son obligatorios. Huésped de 1–120 caracteres; personas de 1–20
y no superiores a la capacidad de la habitación. Fechas ISO entre 2000 y 2100,
con duración de 1–365 noches. Se permite ingresar reservas históricas para uso
administrativo. Las fechas se almacenan como días civiles ISO, sin zona horaria.

La habitación debe existir, no estar eliminada ni en mantenimiento. Los intervalos
son `[entrada, salida)`: una salida y una nueva entrada el mismo día son compatibles.
Solo CONFIRMADA bloquea fechas. Una colisión devuelve `409 FECHAS_OCUPADAS`.

El servidor fija `precioNoche` desde la habitación y calcula `total = precioNoche × noches`
con BigDecimal/Decimal128. El cliente no elige importe ni estado inicial. Siempre
se crea CONFIRMADA. Estos importes son una cotización, no un cobro ni un asiento contable.

La respuesta incluye `id`, los campos del cuerpo, `estado`, `precioNoche` y `total`.
POST devuelve `Location` e `Idempotency-Replayed`.

## Idempotencia y concurrencia

La misma clave con los mismos datos normalizados devuelve la creación original,
incluidos precio y estado CONFIRMADA, incluso tras cancelar/finalizar. No restaura
la reserva: usa GET para conocer su estado actual. La misma clave con otros datos
devuelve `409 IDEMPOTENCY_KEY_REUTILIZADA`. El id deriva de la clave y del ámbito
`POST:/api/v1/reservas`; no se guarda la clave en texto claro. El historial no caduca.

La creación usa una transacción MongoDB que escribe en la habitación, comprueba
solapamientos e inserta la reserva. La escritura en el contador `reservasActivas`
de la habitación serializa las operaciones concurrentes, incluidas claves distintas.
Si algo falla, se revierte tanto el contador como la reserva. No se comprueba la
disponibilidad y se inserta mediante dos operaciones independientes.

Requiere MongoDB con transacciones (replica set o clúster compatible, como Atlas).
Se usa lectura snapshot y confirmación majority. El índice de disponibilidad se
prepara fuera de la transacción, antes de la primera creación. No se modifica Atlas
al compilar. Se necesitan permisos para índices y escrituras en ambas colecciones.
Referencia: [transacciones de Spring Data MongoDB](https://docs.spring.io/spring-data/mongodb/reference/mongodb/client-session-transactions.html).

Un conflicto transitorio o un commit de resultado incierto devuelve `503` con
`Retry-After: 1`. Reintenta con la misma clave y el mismo cuerpo; no se reintenta
automáticamente. No hay garantía de respuesta inmediata de éxito bajo contención,
pero la reserva y el contador se confirman o revierten juntos.

## Cancelar o finalizar

PUT `/{id}/estado`:

```json
{ "estado": "CANCELADA" }
```

También acepta FINALIZADA, solo a partir de la fecha de salida según
`app.hotel.zone` (por defecto America/Bogota). Se permiten únicamente las transiciones
CONFIRMADA → CANCELADA o CONFIRMADA → FINALIZADA. No se reabren reservas cerradas.
Repetir el mismo estado devuelve el estado actual sin descontar el contador otra vez.
Solicitar otro estado tras el cierre devuelve `409 RESERVA_CERRADA`.

DELETE equivale a cancelar: repetirlo sobre una reserva cancelada devuelve `204`.
Una reserva inexistente da `404`, y una finalizada da `409`. Cancelación/finalización
actualizan estado y contador en una transacción; no requieren Idempotency-Key.

Mientras una habitación tenga reservas CONFIRMADAS, su PUT y DELETE devuelven
`409 HABITACION_CON_RESERVAS`. Esto también aplica a reservas históricas que aún
no se hayan finalizado. No se cambia automáticamente el estado físico de la habitación
(OCUPADA, LIMPIEZA, etc.). No edites manualmente `reservasActivas` ni borres reservas:
el contador forma parte de la integridad entre colecciones.

Esta etapa no incluye reprogramación, cambio de huésped/habitación, check-in,
cobros ni integración de la vista. Para corregir una reserva, cancela y crea otra
con una clave nueva. No es una operación conjunta de reprogramación.

## Verificación

Solo compilación, sin crear ni ejecutar pruebas automatizadas, por solicitud del usuario:

```powershell
.\mvnw.cmd -B -o compile '-Dmaven.test.skip=true'
```

No se ha verificado esta API mediante operaciones reales contra Atlas.
