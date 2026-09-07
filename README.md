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

*(Instructions for building and running will be added as infrastructure and application layers are developed)*
