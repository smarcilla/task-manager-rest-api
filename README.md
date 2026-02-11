# Task Manager REST API

RESTful API for task management with JWT authentication, built with Node.js, Express and MongoDB.

## Technologies Used

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

## Prerequisites

- **Docker** and **Docker Compose** installed
- **pnpm** (optional, only if you want to run the application locally without Docker)

## Start the Application with Docker

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

```

> **Note:** To generate a secure `JWT_SECRET`, you can use:
>
> ```bash
> openssl rand -base64 32
> ```

### 2. Start the Application

```bash
pnpm run docker:up
```

The API will be available at `http://localhost:3000`

### 3. View Logs

```bash
pnpm run docker:logs
```

### 4. Stop the Application

```bash
pnpm run docker:down
```

## Run Tests

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

## Available Endpoints

### Health Check

- `GET /health` - Check API health status

### Authentication

- `POST /register` - Register a new user
- `POST /login` - Login and obtain JWT token

### Tasks (require authentication)

- `GET /tasks` - List tasks for the authenticated user
- `POST /tasks` - Create a new task
- `DELETE /tasks/:id` - Delete a task
- `PATCH /tasks/:id/complete` - Mark task as completed

## API Documentation

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
