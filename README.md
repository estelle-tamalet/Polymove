# Polymove - Lab MI8 gRPC Server

Platform connecting university students with international internship opportunities through a microservices architecture.

## Architecture

This branch focuses on **MI8 gRPC Service** - providing city scoring algorithms and news repository:

- **mi8**: Provides scoring algorithms and news repository (gRPC server on port 50051)
- **Redis**: In-memory data store for news and city scores
- **PostgreSQL**: Database (for other services)
- **MongoDB**: Document store (for offer management)

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Redis (handled by Docker)
- PostgreSQL (handled by Docker)
- MongoDB (handled by Docker)
- `grpcurl` for testing gRPC endpoints (optional)

## Getting Started

### Quick Start (Docker Compose - All Services)

Start all services:

```bash
docker compose up --build
```

Stop all services:

```bash
docker compose down
```

MI8 gRPC server will be available at `localhost:50051`

## Project Structure

```
├── mi8/               MI8 gRPC service - scoring and news
├── erasmumu/          Offer management service
├── laposte/           Subscriber service
├── polytech/          Internship service
├── docker-compose.yml Service orchestration
└── init-db/           Database initialization
```

## MI8 Service (Port 50051 - gRPC)

MI8 provides city scoring and news aggregation via **gRPC** protocol. News is stored in Redis with dynamic city scoring based on tagged events.

### Core Features

- **News Management**: Create, retrieve, and organize news by city
- **City Scoring**: Dynamic scoring based on news tags (innovation, culture, healthcare, entertainment, crisis, crime, disaster)
- **Score Aggregation**: Combines multiple dimensions: safety, economy, quality of life, culture

### gRPC Methods

```
service NewsService {
  rpc GetLatestNews(NewsRequest) returns (NewsResponse)
  rpc GetLatestNewsInCity(CityNewsRequest) returns (NewsResponse)
  rpc GetCityScore(CityRequest) returns (CityScoreResponse)
  rpc GetTopCities(TopCitiesRequest) returns (TopCitiesResponse)
  rpc CreateNews(NewsData) returns (Empty)
}
```

**Test endpoints:**

```bash
# Get latest news (limit 5)
grpcurl -plaintext \
  -proto ./mi8/proto/news.proto \
  -d '{"limit": 5}' \
  localhost:50051 mi8.NewsService/GetLatestNews

# Get news for a city
grpcurl -plaintext \
  -proto ./mi8/proto/news.proto \
  -d '{"city": "Paris", "limit": 3}' \
  localhost:50051 mi8.NewsService/GetLatestNewsInCity

# Get city score
grpcurl -plaintext \
  -proto ./mi8/proto/news.proto \
  -d '{"city": "Paris"}' \
  localhost:50051 mi8.NewsService/GetCityScore

# Create news (triggers city score update)
grpcurl -plaintext \
  -proto ./mi8/proto/news.proto \
  -d '{
    "id": "news-001",
    "title": "Tech boom in Paris",
    "city": "Paris",
    "country": "France",
    "content": "Great opportunities for tech startups",
    "tags": ["innovation", "tech"],
    "createdAt": 1775124000
  }' \
  localhost:50051 mi8.NewsService/CreateNews

# Get top cities by score
grpcurl -plaintext \
  -proto ./mi8/proto/news.proto \
  -d '{"limit": 10}' \
  localhost:50051 mi8.NewsService/GetTopCities
```

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

- **Redis**: Stores news articles and city scores
  - Keys: `news:{id}`, `news:latest`, `news:city:{city}`, `city:{city}:score`
  - Persisted across restarts via volume
- **PostgreSQL**: Stores student and internship data
- **MongoDB**: Stores offer documents