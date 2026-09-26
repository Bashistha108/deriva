# Deriva Startup Guide

Deriva is a modular monolith (Java/Spring Boot) and a Next.js frontend, backed by PostgreSQL.

## Prerequisites

- Docker and Docker Compose installed
- (Optional) Java 21 and Node.js 20+ for local development outside Docker

## Running the Platform (Docker Compose)

To start the entire stack (Database, Backend API, Frontend UI), run from the project root:

```bash
docker-compose up --build -d
```

### Accessing the Services

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Swagger API Docs**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Actuator Health**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)

## Local Development (Without Docker)

If you prefer to run the applications locally for development:

1. **Start the Database**:
   ```bash
   docker-compose up -d postgres
   ```

2. **Start the Backend**:
   ```bash
   cd backend
   ./mvnw spring-boot:run -pl deriva-bootstrap
   ```

3. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## Troubleshooting

- **Database Connections**: If the backend fails to connect to PostgreSQL, ensure port `5432` is not occupied by a local Postgres instance.
- **Liquibase Errors**: The backend uses Liquibase for schema migrations. If the schema gets corrupted, you can wipe the database volume using `docker-compose down -v` and restart.
