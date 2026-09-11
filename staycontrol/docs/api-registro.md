# Registro de usuario

`POST /api/v1/auth/registro`

Obtener primero `GET /api/v1/auth/csrf`, conservar la cookie y enviar el token
con el nombre de cabecera devuelto. Enviar `Content-Type: application/json`
y `Idempotency-Key` (1 a 128 letras, números, puntos, guiones, dos puntos o guiones bajos).

```json
{
  "usuario": "María",
  "email": "maria@example.com",
  "password": "una-clave-larga-de-ejemplo"
}
```

Nombre: 1 a 120 caracteres, recortado y sin controles. No es único; el inicio de
sesión usa email normalizado a minúsculas. Contraseña: 12 a 128 caracteres,
no solo espacios; no se recorta. No se acepta rol desde el cliente.

Devuelve 201 con `{email, usuario, rol: "USER"}` y `Idempotency-Replayed: false`.
La contraseña solo se guarda con hash PBKDF2, nunca en respuesta o logs.
El email es `_id` de MongoDB: las solicitudes concurrentes no duplican cuentas.

La idempotencia está delimitada por correo y operación: misma clave, correo,
nombre y contraseña devuelven 201 y `Idempotency-Replayed: true`. Otro correo tiene
un ámbito distinto. Cuenta existente con otra clave o datos: 409 genérico; no se
sobrescribe. El reintento compara el hash actual: al implementar cambio de contraseña
habrá que definir la política de reintentos posterior.

El registro no inicia sesión ni verifica propiedad del correo. USER puede iniciar
sesión, consultar `/auth/me` y cerrar sesión; las APIs de negocio requieren ADMIN.
No existe endpoint público para elevar roles. El aprovisionamiento ADMIN no convierte
una cuenta USER existente: usar un correo administrativo separado.

400: datos o clave inválidos. 403: CSRF inválido. 409: registro no disponible.
429: límite compartido con login, 10 intentos por IP/minuto por instancia.
503: persistencia no disponible; reintentar con la misma clave.
El límite local no sustituye protección distribuida contra abuso ni verificación de correo.

Las vistas permanecen sin conectar. No se implementaron endpoints de recuperación,
envío de correos ni restablecimiento. Solo compilación; sin pruebas automatizadas ni
creación de usuarios reales durante esta implementación.
