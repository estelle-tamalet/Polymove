# Polymove

Platform connecting university students with international internship opportunities through a microservices architecture.

## Architecture

The application is built on independent microservices that communicate via RabbitMQ:

- **erasmumu**: Manages internship offers aggregation and publishing
- **laposte**: Handles subscriber management and subscriptions
- **mi8**: Provides scoring algorithms and news repository
- **polytech**: Core service for internship management, student recommendations, and notifications
- **frontend**: React/Vite web application for user interface

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (handled by Docker)
- RabbitMQ (handled by Docker)

## Getting Started

Start all services:

```bash
docker compose up --build
```

Stop all services:

```bash
docker compose down
```

The frontend will be available at `http://localhost:5173`

## Project Structure

```
├── erasmumu/          Offer management service
├── laposte/           Subscriber service
├── mi8/               Scoring and news service
├── polytech/          Main internship and recommendation service
├── frontend/          React web application
├── docker-compose.yml Service orchestration
└── init-db/           Database initialization
```

## Services Communication

Services communicate asynchronously using RabbitMQ message queues. PostgreSQL is used as the primary data store.
