# StayControl

El proyecto activo es esta carpeta: contiene `pom.xml`, `frontend/` y `src/`.
En VS Code se ejecuta la clase `com.example.staycontrol.StaycontrolApplication`
del proyecto Maven `staycontrol`.

## Organización MVC y servicios

```text
staycontrol/
├── frontend/
│   ├── models/                           Datos y estado del frontend
│   │   ├── Habitacion.js
│   │   └── TareaLimpieza.js
│   ├── views/                            Los seis archivos HTML
│   ├── controllers/                      Eventos y actualización de las vistas
│   │   ├── loginController.js
│   │   ├── dashboardController.js
│   │   ├── habitacionesController.js
│   │   ├── reservasController.js
│   │   ├── finanzasController.js
│   │   └── limpiezaController.js
│   ├── services/                         Operaciones y comunicación HTTP
│   │   ├── habitacionesService.js
│   │   ├── limpiezaService.js
│   │   └── apiService.js
│   ├── assets/css/                       Estilos por vista
│   ├── tests/                            Pruebas del frontend
│   └── package.json                      Módulos JavaScript y comando de pruebas
├── src/main/
│   ├── java/com/example/staycontrol/
│   │   ├── StaycontrolApplication.java    Arranque de Spring Boot
│   │   ├── config/MongoConfig.java        Cliente MongoDB y verificación al arrancar
│   │   ├── service/MongoConnectionService.java  Ping de conexión
│   │   ├── model/                        Modelo: datos y reglas de dominio
│   │   │   └── package-info.java
│   │   └── controller/                   Controlador: rutas HTTP
│   │       └── ViewController.java
│   └── resources/
│       └── application.properties        Configuración
├── src/test/java/com/example/staycontrol/ Pruebas del backend
└── pom.xml                               Dependencias y compilación
```

En el frontend, **models** representa los datos y su estado, **views** contiene
el HTML y **controllers** conecta los eventos del usuario con los servicios y
actualiza el DOM. Los controladores se cargan como módulos JavaScript.

**services** contiene las operaciones sobre los modelos: `HabitacionesService`
filtra las habitaciones y `LimpiezaService` cambia el estado de las tareas.
Estos servicios trabajan en memoria. Los controladores inicializan sus modelos
con los datos de ejemplo presentes en el HTML, sin duplicar esas listas en otro
archivo. Al recargar se restaura el estado de ejemplo.

`apiService.js` centraliza futuras peticiones JSON a Spring Boot mediante
`requestJson(url, opciones)`. Está preparado, pero todavía no se invoca porque
las rutas de datos del backend están pendientes. Los servicios podrán usarlo
cuando existan esas rutas. El login aún no autentica usuarios.

En Java, `model/` sigue preparado para definir los modelos del backend.
`controller/ViewController.java` contiene los mappings de Spring MVC y redirige
cada ruta a su HTML. `MongoConfig` administra el cliente MongoDB y Spring Data
proporciona `MongoTemplate` para las futuras operaciones. Las entidades,
repositorios, servicios de negocio y controladores de datos siguen pendientes.

## Conexión a MongoDB Atlas

La conexión corresponde al clúster `staycontrol.hxq6tmx.mongodb.net` y al usuario
`marcomartinezmalagon1203_db_user` de la URI proporcionada. Se eligió `staycontrol`
como nombre de base; cámbialo en `MONGODB_DATABASE` si necesitas otro nombre.

1. Abre el archivo `.env` de la raíz del workspace, un nivel por encima de esta
   carpeta. También puedes copiar allí `.env.example` si no existe.
2. Sustituye `<db_password>` en `MONGODB_URI` por la contraseña del usuario de
   base de datos de Atlas. La contraseña de esa URI debe estar codificada para
   URL: por ejemplo, `@` se escribe `%40`. No añadas comillas alrededor del valor.
3. En Atlas, comprueba que tu IP esté autorizada en **Network Access** y que el
   usuario tenga los permisos necesarios sobre la base seleccionada.
4. Reinicia el proyecto `staycontrol` desde Spring Boot Dashboard.

La aplicación importa `.env` desde la carpeta de ejecución o su carpeta superior;
también acepta las variables de entorno `MONGODB_URI` y `MONGODB_DATABASE`.
El archivo local está excluido de Git y no se empaqueta dentro del JAR ni del
frontend. La conexión se realiza únicamente desde Java.

El cliente compartido usa Stable API V1 y Spring lo cierra al detener la
aplicación. `MongoConnectionService` envía `ping` a la base configurada durante
el arranque. Si la respuesta es correcta, la consola mostrará:

```text
Conexión a MongoDB verificada correctamente (ping OK).
```

Si falta la contraseña o falla el ping, el inicio se interrumpe con un mensaje
de configuración o conexión. No se sustituye Atlas por una base local. El ping
no crea colecciones ni datos y no comprueba permisos de escritura.

Las pruebas automatizadas usan un cliente simulado y desactivan únicamente el
ping de arranque con `app.mongodb.verify-on-startup=false`. No acceden a Atlas:
que esas pruebas pasen no confirma una conexión real al clúster. Con la URI de
ejemplo todavía falta reemplazar `<db_password>` antes de iniciar la aplicación.

La configuración corresponde a
[MongoDB en Spring Boot](https://docs.spring.io/spring-boot/reference/data/nosql.html#data.nosql.mongodb)
y al [cliente Java de MongoDB](https://www.mongodb.com/docs/drivers/java/sync/current/connection/mongoclient/).

## Rutas de las vistas

| Ruta | HTML |
| --- | --- |
| `/` o `/login` | `/views/login.html` |
| `/dashboard` | `/views/dashboard.html` |
| `/habitaciones` | `/views/habitaciones.html` |
| `/reservas` | `/views/reservas.html` |
| `/finanzas` | `/views/finanzas.html` |
| `/limpieza` | `/views/limpieza.html` |

También funcionan los alias `/login.html`, `/dashboard.html`, `/habitaciones.html`,
`/reservas.html`, `/finanzas.html` y `/limpieza.html`, y los enlaces directos
`/pages/*.html` existentes, que redirigen a `/views/*.html`. Estas rutas sirven
las pantallas; los botones que aún
no tienen navegación o acciones de negocio siguen pendientes de implementación.

## Ejecución

Desde esta carpeta, en PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

También se puede iniciar el proyecto `staycontrol` desde Spring Boot Dashboard.
Abre `http://localhost:8080/` o cualquiera de las rutas de la tabla. Reinicia
Spring Boot después de modificar controladores o configuración.

Durante el desarrollo, Spring Boot lee primero `frontend/` desde el directorio
de ejecución. Maven también copia las vistas a `target/classes/static/` y las
incluye en el JAR; esa copia permite ejecutarlo desde otra carpeta. Edita los
archivos de `frontend/`, no las copias generadas en `target/`. Vuelve a compilar
para actualizar el contenido empaquetado.

Abre las vistas por HTTP desde Spring Boot: sus imports de JavaScript necesitan
un servidor. `package.json` declara módulos ES y no añade dependencias ni un
servidor Node para ejecutar la aplicación.

```powershell
.\mvnw.cmd clean package
java -jar target/staycontrol-0.0.1-SNAPSHOT.jar
```

Para probar los modelos, servicios y referencias del frontend desde esta carpeta:

```powershell
node --test frontend/tests/*.test.js
```

Esta configuración utiliza el soporte de
[recursos estáticos de Spring Boot](https://docs.spring.io/spring-boot/reference/web/servlet.html#web.servlet.spring-mvc.static-content)
y los [directorios de recursos de Maven](https://maven.apache.org/plugins/maven-resources-plugin/examples/resource-directory.html).
