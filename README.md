# Polymove - Lab 3 API Gateway

Platform connecting university students with international internship opportunities through a microservices architecture with API Gateway.

## Architecture

The application uses an API Gateway pattern to route requests to independent microservices:

- **API Gateway**: Central entry point routing requests to backend services
- **erasmumu**: Manages internship offers aggregation
- **mi8**: Provides scoring algorithms and news repository
- **polytech**: Core service for internship management, student recommendations, and notifications
- **frontend**: React/Vite web application for user interface

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (handled by Docker)
- MongoDB (handled by Docker)
- Redis (handled by Docker)

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
├── mi8/               Scoring and news service
├── polytech/          Main internship and API Gateway service
├── frontend/          React web application
├── docker-compose.yml Service orchestration
└── init-db/           Database initialization
```

## Services Communication

API Gateway provides a unified HTTP interface to route requests. PostgreSQL, MongoDB, and Redis are used as data stores.
