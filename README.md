# Task Manager REST API

API RESTful para gestión de tareas con autenticación JWT, construida con Node.js, Express y MongoDB.

## 🛠️ Tecnologías Utilizadas

- **Node.js** (v25.6.0) - Entorno de ejecución
- **Express** (v5.2.1) - Framework web
- **MongoDB** (v8.0) + **Mongoose** - Base de datos NoSQL
- **JWT** (jsonwebtoken) - Autenticación y autorización
- **bcrypt** - Hash de contraseñas
- **Zod** - Validación de esquemas
- **Jest** + **Supertest** - Testing E2E
- **Docker** + **Docker Compose** - Contenedorización
- **ESLint** + **Prettier** - Linting y formateo de código
- **pnpm** - Gestor de paquetes

## 📋 Prerequisitos

- **Docker** y **Docker Compose** instalados
- **pnpm** (opcional, solo si quieres ejecutar la aplicación localmente sin Docker)

## 🚀 Levantar la Aplicación con Docker

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en el archivo `.env.example`:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus valores:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h

# Database Configuration
MONGO_USER=admin
MONGO_PASS=password_seguro_123
MONGO_DB=task_manager

# API Configuration (opcional)
API_PORT=3000
```

> **Nota:** Para generar un `JWT_SECRET` seguro, puedes usar:
>
> ```bash
> openssl rand -base64 32
> ```

### 2. Iniciar la Aplicación

```bash
# Construir y levantar los contenedores
pnpm run docker:up

# O usando Docker Compose directamente
docker compose up --build -d
```

La API estará disponible en `http://localhost:3000`

### 3. Ver Logs

```bash
# Ver logs de la API
pnpm run docker:logs

# O usando Docker directamente
docker compose logs -f api
```

### 4. Detener la Aplicación

```bash
# Detener los contenedores
pnpm run docker:down

# O usando Docker directamente
docker compose down
```

## 🧪 Ejecutar Tests

Los tests utilizan **Jest** con **mongodb-memory-server** (base de datos en memoria) para pruebas E2E.

### Ejecutar todos los tests E2E

```bash
pnpm run test:e2e
```

### Ejecutar tests unitarios (cuando estén disponibles)

```bash
pnpm run test
```

### Ejecutar todos los tests

```bash
pnpm run test:all
```

### Ver cobertura de código

Los tests generan automáticamente un reporte de cobertura en el directorio `coverage/lcov-report/index.html`.

## 📡 Endpoints Disponibles

### Autenticación

- `POST /register` - Registrar un nuevo usuario
- `POST /login` - Iniciar sesión y obtener token JWT

### Tareas (requieren autenticación)

- `GET /tasks` - Listar tareas del usuario autenticado
- `POST /tasks` - Crear una nueva tarea
- `DELETE /tasks/:id` - Eliminar una tarea
- `PATCH /tasks/:id/complete` - Marcar tarea como completada

> **Nota:** Todas las peticiones a `/tasks/*` requieren el header:
>
> ```
> Authorization: Bearer <token>
> ```

## 🔐 Autenticación

El proyecto implementa autenticación basada en JWT (JSON Web Tokens):

- **Algoritmo:** HS256
- **Librería:** `jsonwebtoken`
- **Expiración:** Configurable vía `JWT_EXPIRES_IN` (por defecto: 1h)
- **Hash de contraseñas:** bcrypt con salt rounds = 10

La clave secreta JWT se genera mediante:

```bash
openssl rand -base64 32
```

Y se almacena en la variable de entorno `JWT_SECRET`.

## 📁 Estructura del Proyecto

```
src/
├── app.js                    # Configuración de Express
├── index.js                  # Punto de entrada
├── auth/                     # Módulo de autenticación
│   ├── login.handler.js
│   ├── register.handler.js
│   ├── user.model.js
│   └── schemas/
├── tasks/                    # Módulo de tareas
│   ├── task.model.js
│   ├── task.repository.js
│   ├── task.router.js
│   ├── handlers/
│   └── schemas/
└── shared/                   # Utilidades compartidas
    ├── auth/                 # Middleware de autenticación
    ├── db/                   # Cliente de MongoDB
    ├── errors/               # Manejo de errores
    └── validators/           # Validadores de request
```

## ⚡ Performance Considerations

### Database Indexing Strategy

The application implements a strategic indexing approach to optimize query performance while maintaining flexibility:

#### Task Collection Indexes

1. **Compound Index: `{ status: 1, assignee: 1, createdAt: 1, _id: 1 }`**
   - Optimizes queries filtering by status and/or assignee
   - Ensures efficient sorting by creation date
   - Example queries: `?status=assigned`, `?status=assigned&assignee=John Doe`

2. **Secondary Index: `{ assignee: 1, createdAt: 1, _id: 1 }`**
   - Optimizes queries filtering only by assignee
   - Example query: `?assignee=John Doe`

3. **User Collection: `{ email: 1 }` (unique)**
   - Automatically created via `unique: true` constraint
   - Optimizes login operations and prevents duplicate emails

#### Title Search Trade-offs

The title search feature uses case-insensitive regex for substring matching (`$regex` with `$options: 'i'`), allowing flexible searches like:

- `?title=imp` → finds "Tarea **imp**ortante"
- `?title=orta` → finds "Tarea imp**orta**nte"

**Why no index on title?**
MongoDB cannot efficiently utilize standard indexes for case-insensitive substring searches. The regex pattern needs to scan documents to find matches anywhere in the text.

**Performance characteristics:**

| Query Pattern                      | Performance                | Index Used             |
| ---------------------------------- | -------------------------- | ---------------------- |
| `?status=assigned`                 | ⭐⭐⭐⭐⭐ Fast (~10-50ms) | Compound index         |
| `?assignee=John`                   | ⭐⭐⭐⭐⭐ Fast (~10-50ms) | Secondary index        |
| `?status=assigned&assignee=John`   | ⭐⭐⭐⭐⭐ Fast (~10-50ms) | Compound index         |
| `?title=important`                 | ⭐⭐ Moderate (~200-500ms) | None (collection scan) |
| `?status=assigned&title=important` | ⭐⭐⭐⭐ Good (~50-100ms)  | Compound index + regex |

_Performance estimates based on ~10,000 documents_

**Scaling considerations:**

For production deployments with 100k+ documents or heavy text search requirements, consider:

- **MongoDB Atlas Search**: Integrated full-text search with Lucene-based indexing
- **Elasticsearch**: Industry-standard for advanced text search and autocomplete
- **Algolia/Typesense**: Managed search services optimized for instant search experiences

The current implementation provides an excellent balance for the expected scale while maintaining code simplicity and flexible search capabilities.

## 📝 Tareas Pendientes

- #TODO: Add Swagger documentation
- #TODO: Add unit tests (determine where). We use the mutation testing library Stryker

---
