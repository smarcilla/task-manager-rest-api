# Task Manager REST API

RESTful API for task management with JWT authentication, built with Node.js, Express and MongoDB.

## 🛠️ Technologies Used

- **Node.js** (v25.6.0) - Runtime environment
- **Express** (v5.2.1) - Web framework
- **MongoDB** (v8.0) + **Mongoose** - NoSQL database
- **JWT** (jsonwebtoken) - Authentication and authorization
- **bcrypt** - Password hashing
- **Zod** - Schema validation
- **Jest** + **Supertest** - E2E testing
- **Docker** + **Docker Compose** - Containerization
- **ESLint** + **Prettier** - Code linting and formatting
- **pnpm** - Package manager

## 📋 Prerequisites

- **Docker** and **Docker Compose** installed
- **pnpm** (optional, only if you want to run the application locally without Docker)

## 🚀 Start the Application with Docker

### 1. Configure Environment Variables

Create a `.env` file in the project root based on the `.env.example` file:

```bash
cp .env.example .env
```

Edit the `.env` file with your values:

```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h

# Database Configuration
MONGO_USER=admin
MONGO_PASS=password_seguro_123
MONGO_DB=task_manager

# API Configuration (optional)
API_PORT=3000
```

> **Note:** To generate a secure `JWT_SECRET`, you can use:
>
> ```bash
> openssl rand -base64 32
> ```

### 2. Start the Application

```bash
# Build and start the containers
pnpm run docker:up

# Or using Docker Compose directly
docker compose up --build -d
```

The API will be available at `http://localhost:3000`

### 3. View Logs

```bash
# View API logs
pnpm run docker:logs

# Or using Docker directly
docker compose logs -f api
```

### 4. Stop the Application

```bash
# Stop the containers
pnpm run docker:down

# Or using Docker directly
docker compose down
```

## 🧪 Run Tests

Tests use **Jest** with **mongodb-memory-server** (in-memory database) for E2E testing.

### Run all E2E tests

```bash
pnpm run test:e2e
```

### Run unit tests (when available)

```bash
pnpm run test:unit
```

### Run all tests

```bash
pnpm run test
```

### View code coverage

Tests automatically generate a coverage report in the `coverage/lcov-report/index.html` directory.

## 📡 Available Endpoints

### Authentication

- `POST /register` - Register a new user
- `POST /login` - Login and obtain JWT token

### Tasks (require authentication)

- `GET /tasks` - List tasks for the authenticated user
- `POST /tasks` - Create a new task
- `DELETE /tasks/:id` - Delete a task
- `PATCH /tasks/:id/complete` - Mark task as completed

> **Note:** All requests to `/tasks/*` require the header:
>
> ```
> Authorization: Bearer <token>
> ```

## � API Documentation

While Swagger documentation is not available, a comprehensive **Postman Collection** is included to test all API endpoints.

### Using the Postman Collection

1. **Import the collection** into Postman:
   - File: `docs/task-manager-api.postman_collection.json`
   - In Postman: File → Import → Select the JSON file

2. **Collection features**:
   - Pre-configured requests for all endpoints
   - Automated tests for each endpoint
   - Environment variables for tokens and IDs
   - Complete authentication flow (register → login → authenticated requests)

3. **Usage workflow**:
   1. Run "Register Success" to create a test user
   2. Run "Login Success" to obtain JWT token (automatically saved)
   3. Test any task endpoint (token is auto-included)

The collection includes tests for success cases, validation errors, authentication errors, and edge cases.

## �🔐 Authentication

The project implements JWT-based authentication (JSON Web Tokens):

- **Algorithm:** HS256
- **Library:** `jsonwebtoken`
- **Expiration:** Configurable via `JWT_EXPIRES_IN` (default: 1h)
- **Password hashing:** bcrypt with salt rounds = 10

The JWT secret key is generated using:

```bash
openssl rand -base64 32
```

And is stored in the `JWT_SECRET` environment variable.

## 📁 Project Structure

```
src/
├── app.js                    # Express configuration
├── index.js                  # Entry point
├── auth/                     # Authentication module
│   ├── login.handler.js
│   ├── register.handler.js
│   ├── user.model.js
│   └── schemas/
├── tasks/                    # Tasks module
│   ├── task.model.js
│   ├── task.repository.js
│   ├── task.router.js
│   ├── handlers/
│   └── schemas/
└── shared/                   # Shared utilities
    ├── auth/                 # Authentication middleware
    ├── db/                   # MongoDB client
    ├── errors/               # Error handling
    └── validators/           # Request validators
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

---
