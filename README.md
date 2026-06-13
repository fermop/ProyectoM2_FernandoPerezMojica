# API REST de Autores y Publicaciones

API REST modular y moderna desarrollada con Node.js, Express y PostgreSQL para gestionar una plataforma de autores y sus publicaciones, siguiendo las mejores prácticas de diseño, seguridad y pruebas de integración.

> [!WARNING]
> **Nota para los evaluadores (Despliegue en la Nube)**:
> Esta API está desplegada utilizando el plan gratuito de **Railway**. Debido a las políticas de esta plataforma, si la aplicación no ha recibido tráfico en las últimas horas, los servicios y la base de datos entrarán en **modo de reposo (sleep mode)** automáticamente.
> 
> Al realizar la **primera petición** (o intentar acceder a Swagger UI), el servidor puede demorar **entre 15 y 50 segundos** en reiniciarse e inicializar la conexión con PostgreSQL. Las peticiones subsecuentes responderán de forma instantánea.

---

- 🌐 URL de API: [https://proyectom2fernandoperezmojica-production.up.railway.app/api/health](https://proyectom2fernandoperezmojica-production.up.railway.app/api/health)
- 📁 Documentación de endpoints en Swagger UI: [https://proyectom2fernandoperezmojica-production.up.railway.app/api-docs](https://proyectom2fernandoperezmojica-production.up.railway.app/api-docs)

## Características Principales

- **Arquitectura Modular**: Separación limpia en capas (Rutas, Middlewares, Controladores, Servicios y Acceso a Base de Datos).
- **Persistencia Relacional**: Conexión nativa a PostgreSQL mediante un Pool optimizado (`pg`).
- **Seguridad Activa**: Consultas SQL 100% parametrizadas para evitar ataques de Inyección SQL.
- **Validaciones Acumulativas**: Middlewares nativos que verifican formatos de email, límites de caracteres, campos extras y restricciones de negocio antes de tocar la base de datos.
- **Documentación OpenAPI 3.1.1**: Especificación completa montada dinámicamente con Swagger UI.
- **Pruebas Unitarias e Integración**: Cobertura automatizada con Vitest y Supertest. Incluye pruebas unitarias aisladas para la lógica de validación de campos y pruebas de integración secuenciales contra la base de datos real (con limpieza automática).
- **Apagado Gracioso (Graceful Shutdown)**: Liberación ordenada de recursos y conexiones al recibir señales `SIGINT` o `SIGTERM`.

---

## Estructura del Proyecto e Importaciones ECMAScript

El proyecto sigue una estructura modular por capas y aprovecha las capacidades nativas avanzadas de Node.js para la importación de módulos.

### Estructura de Carpetas

```text
├── openapi.yaml                 # Especificación OpenAPI 3.1.1 de la API
├── package.json                 # Configuración del proyecto, dependencias y scripts
├── vitest.config.js             # Configuración de Vitest (secuencialización de tests)
├── .env.example                 # Plantilla de variables de entorno
└── src/
    ├── app.js                   # Configuración de la aplicación Express y Swagger UI
    ├── server.js                # Punto de entrada del servidor y Graceful Shutdown
    ├── controllers/             # Controladores (manejan req, res y códigos HTTP)
    │   ├── authors.controller.js
    │   └── posts.controller.js
    ├── database/                # Configuración de BD y scripts de inicialización SQL
    │   ├── config.js            # Instancia y configuración del Pool de pg
    │   └── scripts/
    │       ├── seed.sql         # Semilla SQL con registros iniciales de prueba
    │       └── setup.sql        # Estructura física de tablas relacionales
    ├── middlewares/             # Middlewares (errores y validaciones defensivas)
    │   ├── errorHandler.middleware.js
    │   └── validate.middleware.js
    ├── routes/                  # Definición de rutas Express
    │   ├── index.js             # Router principal
    │   ├── authors.routes.js
    │   └── posts.routes.js
    ├── services/                # Capa de negocio (consultas SQL parametrizadas a BD)
    │   ├── authors.service.js
    │   └── posts.service.js
    ├── tests/                   # Suite de pruebas unitarias e integración
    │   ├── validators.unit.test.js
    │   ├── authors.test.js
    │   └── posts.test.js
    └── utils/                   # Utilidades y lógica de validación de campos
        └── validators.js
```

### Importaciones ECMAScript y Subpath Imports (Alias de Rutas)

1. **Módulos Nativos (ESM)**: El proyecto está configurado con `"type": "module"` en `package.json`. Esto habilita la sintaxis estándar de JS (`import`/`export`) en lugar de CommonJS (`require`), mejorando el rendimiento y la interoperabilidad de módulos modernos.
2. **Subpath Imports (Alias de Rutas)**: Para evitar el acoplamiento y el "infierno de rutas relativas" (`../../../../routes`), se implementó la especificación de **Subpath Imports nativa de Node.js** a través del campo `"imports"` en `package.json`. Esto nos permite importar módulos de cualquier parte del proyecto utilizando alias limpios, legibles y fijos:
   - `#app` apunta a `./src/app.js`
   - `#database/*` apunta a `./src/database/*`
   - `#controllers/*` apunta a `./src/controllers/*`
   - `#middlewares/*` apunta a `./src/middlewares/*`
   - `#routes/*` apunta a `./src/routes/*`
   - `#services/*` apunta a `./src/services/*`
   - `#utils/*` apunta a `./src/utils/*`

*Ejemplo de uso:*
```javascript
// En lugar de usar rutas relativas frágiles:
// import { pool } from '../../database/config.js'

// Usamos el alias nativo definido:
import { pool } from '#database/config.js'
```

---

## Requisitos Previos

En caso de no contar con alguno, consulte la siguiente documentación oficial según sea su sistema operativo.

Asegúrate de tener instalado en tu sistema local:
- [**Node.js**](https://nodejs.org/es/download) (versión 20.x o superior)
- **npm** (gestor de paquetes de Node)
- [**PostgreSQL**](https://www.postgresql.org/download/) (versión 18 o superior activa localmente)

---

## Configuración y Ejecución Local

### 1. Clonar el repositorio e instalar dependencias
Clona el repositorio en tu carpeta de preferencia:

```bash
git clone https://github.com/fermop/ProyectoM2_FernandoPerezMojica.git
```

Instala los paquetes necesarios definidos en el `package.json` ejecutando el siguiente comando en una terminal desde la raíz del proyecto:
```bash
npm install
```

### 2. Crear el esquema y la semilla SQL
Crea una base de datos local en PostgreSQL (ej. `blog_db`). Luego, ejecuta los scripts de configuración relacional y semilla en orden desde tu terminal (importante abrir una terminal en la raíz del proyecto) para preparar las tablas relacionales y registros de prueba:

```bash
# 1. Crear las tablas relacionales y restricciones (ON DELETE CASCADE)
psql -U tu_usuario_postgres -d nombre_de_tu_bd -f src/database/scripts/setup.sql

# 2. (Opcional) Cargar los registros iniciales de prueba (seed data)
psql -U tu_usuario_postgres -d nombre_de_tu_bd -f src/database/scripts/seed.sql
```

### 3. Configurar las variables de entorno
Copia el archivo de ejemplo de variables de entorno y renómbralo a `.env`:
```bash
cp .env.example .env
```
Abre el archivo `.env` recién creado y completa tus credenciales de PostgreSQL configuradas en el paso anterior:
```env
PORT=3000

DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nombre_de_tu_bd

NODE_ENV=development
```

### 4. Iniciar el servidor de desarrollo
Levanta la API en modo observación caliente (hot-reload):
```bash
npm run dev
```
El servidor se ejecutará en: `http://localhost:3000`

---

## Suite de Pruebas (Testing)

La aplicación cuenta con dos tipos de pruebas ejecutadas bajo la suite de **Vitest**:

### 1. Pruebas Unitarias (Unit Tests)
- **Ubicación**: `src/tests/validators.unit.test.js`
- **Alcance**: Valida de manera totalmente aislada y pura las funciones de validación lógica de campos (`name`, `email`, `bio`, `title`, `content`), verificando casos de éxito y de error (límites de longitud, caracteres especiales).

### 2. Pruebas de Integración (Integration Tests)
- **Ubicación**: `src/tests/authors.test.js` y `src/tests/posts.test.js`
- **Alcance**: Comprueba el flujo completo del CRUD simulando peticiones HTTP mediante `supertest`.
- **Conexión a BD**: Ejecuta consultas directamente sobre la base de datos PostgreSQL real. El archivo `vitest.config.js` está configurado con `fileParallelism: false` para evitar colisiones de concurrencia al limpiar las tablas (`TRUNCATE ... RESTART IDENTITY`) antes de cada test individual.

### Ejecución de Pruebas:

> [!IMPORTANT]
> 38 test NO PASARÁN si no tienes inicializado el servidor de postgre, si no son correctas tus credenciales para la base de datos local o si la base de datos no ha sido creada con sus respectivas tablas anteriormente.

Para correr la suite completa de pruebas (unitarias e integración) una única vez:
```bash
npm test
```

Para correr las pruebas en modo interactivo/observación (watch mode):
```bash
npm run test:watch
```

---

## Documentación de la API (OpenAPI / Swagger)

La API cuenta con Swagger UI integrado. Una vez levantado el servidor local (`npm run dev`), puedes consultar y probar de forma interactiva todos los endpoints en tu navegador:

- **Swagger UI**:
   - Link local: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
   - Link de la documentación del deployment: [https://proyectom2fernandoperezmojica-production.up.railway.app/api-docs](https://proyectom2fernandoperezmojica-production.up.railway.app/api-docs)
- **Archivo de especificación**: El diseño de la API se encuentra estructurado en el archivo `openapi.yaml` en la raíz del proyecto, adaptado bajo la especificación OpenAPI 3.1.1.

---

## Guía de Despliegue (Railway)

[Railway](https://railway.com/) es una plataforma ideal para desplegar esta API junto con su base de datos PostgreSQL de forma rápida.

### Pasos para el Despliegue:
1. **Tener el Proyecto de Node en un Repositorio de Github**
2. **Crear una cuenta** en caso de no contar con alguna, de preferencia con GitHub para acceder a tus repositorios.
3. **Crear una Base de Datos PostgreSQL en Railway**:
   - En tu panel de Railway, haz clic en **+ New** > **Database** > **Add PostgreSQL**.

   ![Click en New de Dashboard de Railway](./src/doc/img/railway-dashboard-new.png)
   ![Click en Database](./src/doc/img/click-database.png)
   ![Click en PostgreSQL](./src/doc/img/click-postgresql.png)

   - Esto creará un servicio de base de datos relacional y generará automáticamente una variable interna llamada `DATABASE_URL` (ej. `postgresql://postgres:pass@host:port/railway`) que utilizaremos más adelante.

4. **Ejecutar en una Terminal Conectada a la Base de Datos de Railway los Scripts de SQL Para Creación de Tablas y Datos Prueba**:
   - Copiar variable de entorno `DATABASE_URL_PUBLIC` de las variables de entorno del servicio de PostgreSQL.

   ![Variable de entorno DATABASE_URL_PUBLIC](./src/doc/img/copy-public-url-db.png)

   - Abir una terminal en la raíz del proyecto.
   - Ejecutar el siguiente comando para conectarse a la base de datos de Railway:
   ```bash
   psql url_copiada_de_variable_publica_de_DATABASE_URL_PUBLIC
   ```
   - Una vez conectado a la base de datos de Railway ejecuta el siguiente comando para crear las tablas:
   ```bash
   \i src/database/scripts/setup.sql
   ```
   - Posteriormente ejecuta el siguiente comando para insertar los datos prueba del `src/database/scripts/setup.sql`:
   ```bash
   \i src/database/scripts/seed.sql
   ```

4. **Desplegar la Aplicación Node.js**:
   - Conecta tu repositorio de GitHub a Railway mediante **+ Add** > **GitHub Repo > Nombre_de_tu_repo**.

   ![Click en Add desde el proyecto](./src/doc/img/project-click-add.png)
   ![Click en Add desde el proyecto](./src/doc/img/project-click-repository.png)
   ![Click en Add desde el proyecto](./src/doc/img/project-click-git-repo.png)

   - Railway detectará el proyecto de Node.js y leerá el comando `start` en tu `package.json` para ejecutar la API.

5. **Configurar Variables de Entorno en el Servicio de Node**:
   - Ve a la pestaña **Variables** de tu servicio Node en Railway y vincula las siguientes variables:
     - `DATABASE_URL`: `${{Postgres.DATABASE_URL}}` (Esta referencia inyecta la URL de conexión interna provista por el servicio de base de datos de PostgreSQL creado en el paso 3).
     - `NODE_ENV`: `production` (Habilita la validación SSL obligatoria configurada en el Pool de conexiones).
     - Haz click en el botón morado 'Deploy'.

     ![Variables para Node y Deploy](./src/doc/img/node-add-variables-click-deploy.png)

6. **Generar Dominio Público en el Servicio de Node**
   - Ve a la pestaña *Settings* y haz click en el apartado *Network* ubicado a la derecha.
   - Haz click en el botón morado 'Generate Domain'.

   ![Generar dominio público](./src/doc/img/node-generate-domain.png)

   - Digita `8080` en el input y haz click en el botón morado `Generate Domain`

   ![Digitar 8080 y click en Generate Domain](./src/doc/img/puerto-8080-generar.png)

   - Te generará un dominio público para que puedas visitar tus endpoints.

   ![Visualización de dominio público generado](./src/doc/img/public-generated-domain.png)

---

## Registro de Uso de Inteligencia Artificial

Este proyecto ha sido desarrollado en colaboración y pair programming con el chat web de **Google Gemini** y un **Agente de Inteligencia Artificial (Antigravity)**.

### Áreas asistidas por el modelo de IA (Gemini):
- **Estructura de carpetas, rutas relativas e importaciones ECMAScript**: Asesoría y diseño de la organización modular del código por capas. Implementación de Módulos nativos de JavaScript (ESM) para modernizar la sintaxis de importación y configuración de "Subpath Imports" en el `package.json` para definir alias de rutas (ej. `#services/*` o `#database/*`), erradicando definitivamente el "infierno de rutas relativas" (`../../`) y mejorando el mantenimiento a largo plazo.
- **Optimización de Payloads JSON**: Rediseño y refactorización del endpoint de obtención de posts por autor (`GET /api/posts/author/:authorId`) para agrupar los datos de forma estructurada, eliminando la redundancia y optimizando la transferencia en red.
- **Estrategias de Validación Avanzada**: Conceptualización e implementación de la lógica defensiva para mitigar cuerpos vacíos (`{}`) en peticiones de actualización parcial (`PUT`), asegurando la integridad de las operaciones antes de tocar el servidor.
- **Diagnóstico y Debugging de Infraestructura**: Resolución de conflictos de inicialización y orden de ejecución (*hoisting*) en Módulos de ECMAScript (ESM) relacionados con la carga asíncrona de variables de entorno (`process.env`) en el Pool de conexiones.
- **Control de Calidad y Semántica HTTP**: Auditoría y estandarización de códigos de estado HTTP, introduciendo respuestas más precisas como `409 Conflict` para restricciones de unicidad e integrando aserciones rigurosas orientadas a códigos de estado en la suite de pruebas.

### Áreas asistidas por el Agente de IA:
- **Auditoría de Documentación**: Detección de inconsistencias entre la especificación inicial de `openapi.yaml` y los tipos/payloads devueltos por el servidor.
- **Estandarización de OpenAPI**: Rediseño bajo la especificación OpenAPI 3.1.1 incorporando ejemplos enriquecidos para respuestas de error (400, 404, 409) y corrigiendo esquemas faltantes.
- **Migración de Capa de Persistencia**: Transición del mock en memoria (`localDatabase`) a un Pool nativo de base de datos relacional (`pg`) con queries completamente parametrizadas.
- **Desarrollo de Pruebas Unitarias**: Diseño, aislamiento e implementación de la suite de pruebas unitarias para el módulo de validadores.
- **Resolución de Race Conditions en Testing**: Configuración del ciclo de vida del pool en Vitest y desactivación de paralelismo de archivos para pruebas de integración limpias.
- **Arquitectura de Software**: Estructuración del apagado ordenado del servidor y pool de base de datos.
