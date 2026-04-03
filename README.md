# Polymove - Lab 4 Messaging (RabbitMQ)

Platform connecting university students with international internship opportunities through a microservices architecture with **asynchronous messaging**.

## Architecture

This branch focuses on **RabbitMQ-based asynchronous communication** between all microservices:

- **erasmumu**: Manages internship offers aggregation and publishing
- **laposte**: Handles subscriber management and subscriptions
- **mi8**: Provides scoring algorithms and news repository
- **polytech**: Core service for internship management, student recommendations, and notifications
- **frontend**: React/Vite web application
- **RabbitMQ**: Message broker for async communication
- **PostgreSQL**: Primary data store
- **MongoDB**: Document store (for offer management)
- **Redis**: Cache and session store

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- `grpcurl` for testing gRPC endpoints

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

Services will be available at:
- **Frontend**: `http://localhost:5173`
- **Polytech HTTP**: `http://localhost:3000`
- **Erasmumu HTTP**: `http://localhost:4000`
- **Laposte HTTP**: `http://localhost:4001`
- **MI8 gRPC**: `localhost:50051`
- **RabbitMQ**: `localhost:5672` (AMQP) / `http://localhost:15672` (Admin UI)

## Project Structure

```
├── polytech/          Main internship and recommendation service
├── erasmumu/          Offer management service
├── laposte/           Subscriber service
├── mi8/               Scoring and news service
├── frontend/          React web application
├── docker-compose.yml Service orchestration
└── init-db/           Database initialization
```

## Services Communication

Services communicate asynchronously using **RabbitMQ message queues** for critical operations:
- Offer publishing events
- Student notifications
- Subscription updates
- News and scoring updates

## API Documentation

### MI8 Service (Port 50051 - gRPC)

MI8 provides city scoring and news aggregation via **gRPC** protocol. News is stored in Redis with dynamic city scoring based on tagged events.

#### Core Features

- **News Management**: Create, retrieve, and organize news by city
- **City Scoring**: Dynamic scoring based on news tags (innovation, culture, healthcare, entertainment, crisis, crime, disaster)
- **Score Aggregation**: Combines multiple dimensions: safety, economy, quality of life, culture

#### gRPC Methods

```
service NewsService {
  rpc GetLatestNews(NewsRequest) returns (NewsResponse)
  rpc GetLatestNewsInCity(CityNewsRequest) returns (NewsResponse)
  rpc GetCityScore(CityRequest) returns (CityScoreResponse)
  rpc GetTopCities(TopCitiesRequest) returns (TopCitiesResponse)
  rpc CreateNews(NewsData) returns (Empty)
  rpc GetCityStats(string) returns (CityStats)
}
```

#### CityStats Response

```
{
  "city": "Paris",
  "totalOffers": 42,
  "offersByDomain": {
    "engineering": 15,
    "data-science": 12,
    "life-science": 8,
    "business": 7
  },
  "lastOfferDate": 1775124000
}
```

#### Testing MI8 with grpcurl

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
  -d '{"city": "Barcelone", "limit": 3}' \
  localhost:50051 mi8.NewsService/GetLatestNewsInCity

# Get city score
grpcurl -plaintext \
  -proto ./mi8/proto/news.proto \
  -d '{"city": "Barcelone"}' \
  localhost:50051 mi8.NewsService/GetCityScore

# Create news (triggers city score update)
grpcurl -plaintext \
  -proto ./mi8/proto/news.proto \
  -d '{
    "id": "news-03000",
    "title": "Tech boom in Barcelone",
    "city": "Barcelone",
    "country": "Spain", 
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
  -d '{"firstname":"Alice","name":"Smith","domain":"engineering"}'

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
  -d '{"title":"Software Engineer Intern","city":"Paris","domain":"engineering","salary":1200}'

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

### Subscriber Management (Laposte - Port 4001)

**Data Model:**
- **StudentId**: Student identifier
- **Domain**: Internship domain (engineering, data-science, etc.)
- **Channel**: Notification channel (discord, email)
- **Contact**: Contact information (email address or Discord handle)
- **Enabled**: Boolean flag for notification status (subscribed = true, unsubscribed = false)

**Frontend UI Pattern:**
- Display a **Subscribe/Unsubscribe toggle button** for each notification channel
- When `enabled: true` → Show "Unsubscribe" button
- When `enabled: false` → Show "Subscribe" button (highlighted/green)
- Clicking either button toggles the subscription state

**Design Rationale - Frontend Implementation:**
The frontend's unsubscribe uses `PUT with enabled: false` rather than calling the `DELETE` endpoint. This approach:
1. Preserves user preferences in the database
2. Allows students to easily re-subscribe by clicking the same button
3. Keeps the UI simple: one toggle button instead of separate subscribe/add/unsubscribe actions
4. Maintains audit trail of subscription history

**Backend API Endpoints:**
- The `DELETE` endpoint performs a hard delete (removes the preference completely)
- The frontend does not use DELETE directly; it uses `PUT with enabled: false` for unsubscribe functionality
- Direct API calls to DELETE (outside the frontend) will permanently remove the preference

**Endpoints:**

```bash
# Get all subscriber preferences for a student
curl http://localhost:4001/api/subscribers/[STUDENT_ID]

# Add a new notification channel (subscribe)
curl -X POST http://localhost:4001/api/subscribers \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "domain": "engineering",
    "channel": "email",
    "contact": "alice@example.com",
    "enabled": true
  }'

# Update contact info or toggle enabled status (soft disable for unsubscribe)
curl -X PUT http://localhost:4001/api/subscribers/[STUDENT_ID] \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "contact": "newemail@example.com",
    "enabled": true
  }'

# Hard delete a preference (removes completely from database)
# Note: Frontend uses PUT with enabled: false instead of this endpoint
curl -X DELETE "http://localhost:4001/api/subscribers/[STUDENT_ID]?channel=email"
```

### Internship Management (Polytech - Port 3000)

```bash
# Register an internship (student applies for offer)
curl -X POST http://localhost:3000/internship \
  -H "Content-Type: application/json" \
  -d '{"studentId":1,"offerId":"[OFFER_ID]"}'
```

### Notifications Management (Polytech - Port 3000)

**Endpoints:**

```bash
# Get student notifications
curl http://localhost:3000/students/[STUDENT_ID]/notifications

# Mark notification as read
curl -X PUT http://localhost:3000/notifications/[NOTIFICATION_ID]/read
```

## Data Storage

- **Redis**: Stores news articles and city scores
  - Host: `redis` (Docker) / `localhost` (local)
  - Port: `6379`
  - Keys: `news:{id}`, `news:latest`, `news:city:{city}`, `city:{city}:score`
- **PostgreSQL**: Stores student and internship data
  - Host: `postgres` (Docker) / `localhost` (local)
  - Port: `5432`
  - Database: `polymove_polytech`
- **MongoDB**: Stores offer documents
  - Host: `mongo` (Docker) / `localhost` (local)
  - Port: `27017`
  - Database: `erasmumu`
- **RabbitMQ**: Message broker for async communication
  - Host: `rabbitmq` (Docker) / `localhost` (local)
  - Port: `5672` (AMQP)
  - Admin UI: `http://localhost:15672`
