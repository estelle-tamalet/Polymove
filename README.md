# Polymove - Lab Polytech & Erasmumu Sync

Platform connecting university students with international internship opportunities through microservices.

## Architecture

This branch focuses on **synchronous communication between Polytech and Erasmumu services**:

- **Polytech**: Student and internship management service (HTTP on port 3000)
- **Erasmumu**: Offer management service (HTTP on port 4000)
- **PostgreSQL**: Database for Polytech service
- **MongoDB**: Document store for Erasmumu service

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL (handled by Docker)
- MongoDB (handled by Docker)

## Getting Started

### Quick Start (Docker Compose - All Services)

Start all services with one command:

```bash
docker compose up --build
```

Services will be available at:
- **Polytech HTTP**: `http://localhost:3000`
- **Erasmumu HTTP**: `http://localhost:4000`
- **PostgreSQL**: `localhost:5432`
- **MongoDB**: `localhost:27017`

Stop all services:

```bash
docker compose down
```

## Project Structure

```
├── polytech/          Student and internship management service
├── erasmumu/          Offer management service
├── docker-compose.yml Service orchestration
└── init-db/           Database initialization
```

## API Documentation

### Student Management (Polytech - Port 3000)

```bash
# Create a student
curl -X POST http://localhost:3000/student \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Alice","name":"Smith","domain":"Computer Science"}'

# List all students
curl http://localhost:3000/student

# Get specific student
curl http://localhost:3000/student/1

# Update student
curl -X PUT http://localhost:3000/student/1 \
  -H "Content-Type: application/json" \
  -d '{"firstname":"Alice","name":"Johnson","domain":"Data Science"}'

# Delete student
curl -X DELETE http://localhost:3000/student/1
```

### Offers Management (Erasmumu - Port 4000)

```bash
# Create an offer
curl -X POST http://localhost:4000/offer \
  -H "Content-Type: application/json" \
  -d '{"title":"Software Engineer Intern","city":"Brcelone","domain":"engineering","salary":1200}'

# List all offers
curl http://localhost:4000/offers

# Get specific offer
curl http://localhost:4000/offer/[OFFER_ID]

# Update offer
curl -X PUT http://localhost:4000/offer/[OFFER_ID] \
  -H "Content-Type: application/json" \
  -d '{"title":"Senior Software Engineer","domain":"engineering","salary":1500}'

# Delete offer
curl -X DELETE http://localhost:4000/offer/[OFFER_ID]
```

### Internship Management (Polytech - Port 3000)

```bash
# Register an internship (student applies for offer)
curl -X POST http://localhost:3000/internship \
  -H "Content-Type: application/json" \
  -d '{"studentId":1,"offerId":"[OFFER_ID]"}'
```

## Data Storage

- **PostgreSQL**: Stores student and internship data
  - Host: `postgres` (Docker) / `localhost` (local)
  - Port: `5432`
  - Database: `polymove_polytech`
- **MongoDB**: Stores offer documents
  - Host: `mongo` (Docker) / `localhost` (local)
  - Port: `27017`
  - Database: `erasmumu`