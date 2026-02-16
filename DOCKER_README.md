# Survey360 Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker 24.0+ 
- Docker Compose 2.20+

### Development Deployment

```bash
# Clone and navigate to project
cd /app

# Start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

### Production Deployment

```bash
# Set environment variables
export REACT_APP_BACKEND_URL=https://yourdomain.com
export EMERGENT_LLM_KEY=your_llm_key_here

# Build and start
docker-compose up -d --build

# With Flower monitoring
docker-compose --profile monitoring up -d --build
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| frontend | 80 | React application (Nginx) |
| backend | 8001 (internal) | FastAPI application |
| mongo | 27017 (internal) | MongoDB database |
| redis | 6379 (internal) | Redis cache/broker |
| celery-worker | - | Background task processor |
| celery-beat | - | Task scheduler |
| flower | 5555 | Celery monitoring (optional) |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE STACK                       │
│                                                               │
│   ┌─────────────────────────────────────────────────────┐    │
│   │              FRONTEND (Nginx + React)                │    │
│   │                    Port 80                           │    │
│   └──────────────────────┬──────────────────────────────┘    │
│                          │ /api proxy                         │
│                          ▼                                    │
│   ┌─────────────────────────────────────────────────────┐    │
│   │              BACKEND (FastAPI)                       │    │
│   │                 Port 8001                            │    │
│   └─────────┬─────────────────────────┬─────────────────┘    │
│             │                         │                       │
│             ▼                         ▼                       │
│   ┌─────────────────┐       ┌─────────────────────────┐      │
│   │     REDIS       │       │      CELERY WORKER      │      │
│   │  (Broker/Cache) │◄──────│  (Background Tasks)     │      │
│   │   Port 6379     │       └─────────────────────────┘      │
│   └─────────────────┘                                         │
│             │                                                 │
│             │                                                 │
│   ┌─────────────────────────────────────────────────────┐    │
│   │                   MONGODB                            │    │
│   │                  Port 27017                          │    │
│   └─────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

## Scaling

### Horizontal Scaling (Production)
```bash
# Scale backend instances
docker-compose up -d --scale backend=3

# Scale celery workers
docker-compose up -d --scale celery-worker=5
```

### Resource Limits
Services have default resource limits configured. Adjust in `docker-compose.yml` as needed:
- Backend: 2 CPU, 2GB RAM
- Celery Worker: 2 CPU, 2GB RAM
- MongoDB: 2 CPU, 2GB RAM
- Redis: 1 CPU, 512MB RAM

## Data Persistence

Volumes are used for data persistence:
- `mongo-data`: MongoDB data files
- `mongo-config`: MongoDB configuration
- `redis-data`: Redis AOF persistence

### Backup
```bash
# MongoDB backup
docker-compose exec mongo mongodump --out /data/backup

# Copy backup to host
docker cp $(docker-compose ps -q mongo):/data/backup ./backup
```

## Health Checks

All services include health checks:
```bash
# Check service health
docker-compose ps

# View health status
docker inspect --format='{{.State.Health.Status}}' survey360-backend-1
```

## Troubleshooting

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Common Issues

1. **Backend not starting**
   - Check MongoDB connection: `docker-compose logs mongo`
   - Verify Redis is running: `docker-compose exec redis redis-cli ping`

2. **Celery tasks not processing**
   - Check worker logs: `docker-compose logs celery-worker`
   - Verify Redis connection: `docker-compose exec celery-worker redis-cli -h redis ping`

3. **Frontend 502 errors**
   - Ensure backend is healthy: `curl http://localhost:8001/api/health`
   - Check nginx logs: `docker-compose logs frontend`

### Reset Everything
```bash
# Stop and remove containers, networks, volumes
docker-compose down -v

# Remove images
docker-compose down --rmi all

# Fresh start
docker-compose up -d --build
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| REACT_APP_BACKEND_URL | http://localhost | Public URL for API calls |
| EMERGENT_LLM_KEY | - | LLM API key for AI features |
| MONGO_URL | mongodb://mongo:27017 | MongoDB connection string |
| REDIS_URL | redis://redis:6379/0 | Redis connection string |

## Security Notes

1. **Production deployment**: 
   - Use secrets management for sensitive values
   - Enable MongoDB authentication
   - Use Redis password
   - Configure HTTPS/TLS

2. **Network isolation**:
   - All services communicate on internal `survey360-network`
   - Only frontend port 80 and optional flower port 5555 are exposed

## API Testing

```bash
# Test backend health
curl http://localhost/api/health

# Test high-throughput endpoint
curl -X POST http://localhost/api/survey360/submissions/test-survey-123/bulk \
  -H "Content-Type: application/json" \
  -d '{"submissions": [{"responses": {"q1": "answer1"}}]}'
```
