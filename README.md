# Deriva — Professional Options & Derivatives Trading Platform

Deriva is a production-quality, portfolio-grade financial trading platform focused on options and derivatives. It demonstrates advanced Java capabilities, Clean Architecture, and Domain-Driven Design principles within an event-driven microservices ecosystem.

## Tech Stack

* **Backend**: Java 21, Spring Boot, Spring Web, Spring Security, Spring Data JPA, Hibernate, Maven, Vavr, Lombok, MapStruct
* **Architecture**: Clean Architecture, Domain-Driven Design, REST APIs, WebSockets (STOMP), Event-driven
* **Infrastructure**: PostgreSQL, Redis, Kafka, Docker
* **Frontend** (Planned): React, Next.js, TypeScript, Tailwind CSS, shadcn/ui

## Module Structure

The project is structured as a Maven multi-module application to enforce architectural boundaries:

* `deriva-common`: Shared types, utility classes, and common value objects.
* `deriva-domain`: Core business domain models, entities, and interfaces (no external dependencies).
* `deriva-quant`: Pure mathematical models for options pricing (Black-Scholes), Greeks, and IV solvers.
* `deriva-application`: Application services, use cases, and workflow orchestration.
* `deriva-market-data`: Market data generators, simulated feeds, and external provider integrations.
* `deriva-infrastructure`: Implementations for databases, caching, and message brokers.
* `deriva-api`: REST controllers, WebSocket configurations, and security.
* `deriva-bootstrap`: The main Spring Boot application entry point.

## Getting Started

There are multiple ways to start the Deriva application.

### 1. Using the Interactive Script (Recommended)

The easiest way to start both the backend and frontend is by using the interactive startup script.

```bash
chmod +x start.sh
./start.sh
```

This script will:
- Prompt for database credentials (port, username, password, DB name).
- Configure the environment variables.
- Boot the Spring Boot backend (`deriva-bootstrap`).
- Boot the Next.js frontend (`deriva-frontend`).
- Capture all application logs and save them cleanly to a unified `deriva-app.log` file, overriding it on each run.

### 2. Manual Startup

If you prefer to run the components independently:

**Backend:**
```bash
# Navigate to the project root
mvn clean install -DskipTests
cd deriva-bootstrap
mvn spring-boot:run
```

**Frontend:**
```bash
# In a new terminal
cd deriva-frontend
npm install
npm run dev
```

### 3. Using Docker Compose (Fully Containerized)

If you prefer to run the entire stack (Database, Redis, Kafka, Backend, and Frontend) in isolated Docker containers, you can use `docker-compose`.

```bash
# In the project root directory
docker-compose up -d --build
```

This will automatically:
- Provision the infrastructure databases and message brokers.
- Build the multi-module Spring Boot backend via a multi-stage Dockerfile.
- Build the Next.js frontend in standalone mode.
- Link them together via an internal Docker network.

*To view logs for the containerized stack:*
```bash
docker-compose logs -f
```

*To tear down the environment:*
```bash
docker-compose down
```

### 4. Unified Logging

When using `start.sh`, logs are automatically formatted and routed to `deriva-app.log`. 
- Backend logs are prefixed with `[Backend]`
- Frontend logs are prefixed with `[Frontend]`
