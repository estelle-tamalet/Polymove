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

## API Usage

### Authentication
Login via the frontend at `http://localhost:5173` with a student ID (default: 1, 2, or 3 from init data).

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

# Get recommended offers for student
curl http://localhost:3000/students/1/recommended-offers
```

### Offers Management (Erasmumu - Port 4000)

```bash
# Create an offer
curl -X POST http://localhost:4000/offer \
  -H "Content-Type: application/json" \
  -d '{"title":"Software Engineer Intern","company":"TechCorp","city":"Paris","country":"France"}'

# List all offers
curl http://localhost:4000/offers

# Get specific offer
curl http://localhost:4000/offer/[OFFER_ID]

# Update offer
curl -X PUT http://localhost:4000/offer/[OFFER_ID] \
  -H "Content-Type: application/json" \
  -d '{"title":"Senior Software Engineer","company":"TechCorp"}'

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

### Aggregated Offers with Enrichment (Polytech - Port 3000)

```bash
# Get offers with city scores and news enrichment
curl http://localhost:3000/offers
```

### MI8 Service (Port 50051 - gRPC)

MI8 provides city scoring and news aggregation via **gRPC** (not HTTP). It's called internally by Polytech to enrich offers.

**Supported gRPC Methods:**
- `GetLatestNews(limit)`: Get latest news articles
- `GetLatestNewsInCity(city, limit)`: Get news for a specific city
- `GetCityScore(city)`: Get city score (safety, economy, quality of life, culture)
- `GetTopCities(limit)`: Get top-rated cities
- `CreateNews(news)`: Add news (updates city scores)

News is stored in **Redis** and persisted across service restarts.

**Testing MI8 with grpcurl:**

```bash
# Install grpcurl if needed
# brew install grpcurl (macOS) or apt install grpcurl (Linux)

# Get latest news (limit 5)
grpcurl -plaintext \
  -d '{"limit": 5}' \
  localhost:50051 mi8.NewsService/GetLatestNews

# Get news for a city
grpcurl -plaintext \
  -d '{"city": "Paris", "limit": 3}' \
  localhost:50051 mi8.NewsService/GetLatestNewsInCity

# Get city score
grpcurl -plaintext \
  -d '{"city": "Paris"}' \
  localhost:50051 mi8.NewsService/GetCityScore

# Create news
grpcurl -plaintext \
  -d '{"id": "news123", "title": "Tech boom in Paris", "city": "Paris", "country": "France", "content": "Great opportunities", "tags": ["innovation", "tech"]}' \
  localhost:50051 mi8.NewsService/CreateNews

# Get top cities
grpcurl -plaintext \
  -d '{"limit": 10}' \
  localhost:50051 mi8.NewsService/GetTopCities
```
