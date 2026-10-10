# SPA de Habitaciones

Solo el módulo Habitaciones usa navegación SPA. El resto de las vistas sigue
siendo multipágina; ir a Reservas, Finanzas, Limpieza o Dashboard carga otro HTML.
No se añadió un framework ni se cambiaron las APIs, permisos o datos de MongoDB.

## Rutas

- `/views/habitaciones.html#/listado`: listado, búsqueda, filtros y paginación.
- `/views/habitaciones.html#/nueva`: formulario de creación.
- `/views/habitaciones.html#/editar/<id>`: edición de una habitación del hotel autenticado.

Los filtros se guardan en la ruta, por ejemplo `#/listado?estado=DISPONIBLE&pagina=1`.
El ID técnico solo es parte de la ruta/API, no se imprime en las tarjetas.
Los fragmentos no se envían a Spring Boot, por lo que recargar una ruta interna
funciona con la misma vista HTML. También funcionan Atrás y Adelante.

## Ciclo de vida

`habitacionesController.js` inicia `habitacionesSpaController.js` una sola vez.
La sesión, Cuenta, cabecera y navegación se mantienen mientras cambia el contenido.

1. **Montaje:** interpreta la ruta y crea el listado o el formulario.
2. **Actualización:** consulta la API y actualiza el DOM con `textContent`.
3. **Desmontaje:** cancela las lecturas pendientes con `AbortController`, retira
   eventos de esa pantalla y libera la protección del formulario anterior.
4. **Salida del documento:** elimina los eventos globales y la protección de cambios;
   conserva el estado si el navegador guarda el documento en su caché de navegación.

Cambiar de ruta pregunta antes de descartar un formulario modificado. Una escritura
en curso bloquea la navegación interna y no se cancela al abortar lecturas.
La creación conserva la misma clave de idempotencia al reintentar sin editar.
Después de guardar vuelve al listado sin recargar el documento. Los enlaces hacia
reservas y limpieza conservan la habitación seleccionada.

Comprobación de esta entrega: sintaxis JavaScript y revisión estática. No se ejecutan
pruebas automatizadas ni se crean datos para verificar el flujo. Falta validación
interactiva con una sesión del hotel en el navegador.
