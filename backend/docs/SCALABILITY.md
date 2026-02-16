# Survey360 High-Throughput Scalability Guide

## Overview

This guide covers the scalability architecture for handling **500,000+ concurrent submissions** across multiple projects in Survey360.

## Architecture Diagram

```
                                    ┌──────────────────────────────────────────────────────────────┐
                                    │                    KUBERNETES CLUSTER                         │
                                    │                                                               │
    ┌─────────┐                     │   ┌─────────────────────────────────────────────────────┐   │
    │ Users   │                     │   │              LOAD BALANCER (NLB)                     │   │
    │ 500K+   │────────────────────►│   └───────────────────────┬─────────────────────────────┘   │
    └─────────┘                     │                           │                                  │
                                    │                           ▼                                  │
                                    │   ┌─────────────────────────────────────────────────────┐   │
                                    │   │           API PODS (3-50 auto-scaled)                │   │
                                    │   │                                                       │   │
                                    │   │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │   │
                                    │   │  │  Pod 1  │  │  Pod 2  │  │  Pod 3  │  │  Pod N  │ │   │
                                    │   │  │ FastAPI │  │ FastAPI │  │ FastAPI │  │ FastAPI │ │   │
                                    │   │  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘ │   │
                                    │   └───────┼────────────┼────────────┼────────────┼──────┘   │
                                    │           │            │            │            │          │
                                    │           └────────────┴─────┬──────┴────────────┘          │
                                    │                              │                               │
                                    │           ┌──────────────────┴──────────────────┐           │
                                    │           │                                      │           │
                                    │           ▼                                      ▼           │
                                    │   ┌───────────────────┐              ┌───────────────────┐  │
                                    │   │   REDIS CLUSTER   │              │  CELERY WORKERS   │  │
                                    │   │   (6 nodes HA)    │◄────────────►│   (5-50 scaled)   │  │
                                    │   │                   │              │                   │  │
                                    │   │  ┌─────┐ ┌─────┐  │              │  ┌─────┐ ┌─────┐ │  │
                                    │   │  │ M1  │ │ M2  │  │              │  │ W1  │ │ W2  │ │  │
                                    │   │  └──┬──┘ └──┬──┘  │              │  └─────┘ └─────┘ │  │
                                    │   │  ┌──┴──┐ ┌──┴──┐  │              │  ┌─────┐ ┌─────┐ │  │
                                    │   │  │ R1  │ │ R2  │  │              │  │ W3  │ │ WN  │ │  │
                                    │   │  └─────┘ └─────┘  │              │  └─────┘ └─────┘ │  │
                                    │   └───────────────────┘              └───────────────────┘  │
                                    │                                                              │
                                    │                              │                               │
                                    │                              ▼                               │
                                    │   ┌──────────────────────────────────────────────────────┐  │
                                    │   │              MONGODB SHARDED CLUSTER                  │  │
                                    │   │                                                       │  │
                                    │   │  ┌────────────────────────────────────────────────┐  │  │
                                    │   │  │                 MONGOS ROUTERS                  │  │  │
                                    │   │  │            (3 pods, auto-scaled)                │  │  │
                                    │   │  └────────────────────────┬───────────────────────┘  │  │
                                    │   │                           │                          │  │
                                    │   │    ┌──────────────────────┼──────────────────────┐   │  │
                                    │   │    │                      │                      │   │  │
                                    │   │    ▼                      ▼                      ▼   │  │
                                    │   │  ┌──────────┐    ┌──────────┐    ┌──────────┐       │  │
                                    │   │  │ SHARD 1  │    │ SHARD 2  │    │ SHARD 3  │       │  │
                                    │   │  │ (3 node  │    │ (3 node  │    │ (3 node  │       │  │
                                    │   │  │  RS)     │    │  RS)     │    │  RS)     │       │  │
                                    │   │  └──────────┘    └──────────┘    └──────────┘       │  │
                                    │   └──────────────────────────────────────────────────────┘  │
                                    │                                                              │
                                    └──────────────────────────────────────────────────────────────┘
```

## 1. Horizontal Scaling (Kubernetes)

### API Pods Auto-Scaling

**File:** `/app/backend/config/kubernetes/deployment.yaml`

```yaml
# HPA Configuration
minReplicas: 3
maxReplicas: 50
metrics:
  - cpu: 70% utilization
  - memory: 80% utilization
  - http_requests: 1000/second average

# Scale-up: Aggressive (100% or +10 pods per 15s)
# Scale-down: Conservative (10% per 60s, 5min stabilization)
```

**Capacity per Pod:**
- Memory: 512Mi request, 2Gi limit
- CPU: 500m request, 2000m limit
- Concurrent requests: ~500

**Total Cluster Capacity:**
- 50 pods × 500 requests = **25,000 concurrent requests**
- With connection pooling: **100,000+ requests/second**

### Celery Workers Auto-Scaling

```yaml
minReplicas: 5
maxReplicas: 50
metrics:
  - queue_length > 100 per worker
```

**Worker Configuration:**
- 4 concurrent tasks per worker
- 50 workers × 4 = **200 concurrent background tasks**

---

## 2. Queue Scaling (Celery + Redis)

### Priority Queues

**File:** `/app/backend/utils/celery_app.py`

| Queue | Priority | Use Case | Rate Limit |
|-------|----------|----------|------------|
| `critical` | 10 | Real-time submissions | 10,000/s |
| `submissions` | 10 | Survey responses | 10,000/s |
| `high_priority` | 8 | Exports, user actions | - |
| `default` | 5 | Analytics, standard ops | - |
| `low_priority` | 3 | Background cleanup | - |
| `bulk` | 1 | Large exports, migrations | 100/s |

### Task Routing

```python
task_routes = {
    'process_submission': {'queue': 'submissions'},
    'process_bulk_submissions': {'queue': 'submissions'},
    'export_responses': {'queue': 'high_priority'},
    'generate_analytics': {'queue': 'default'},
    'cleanup_old_jobs': {'queue': 'low_priority'},
    'bulk_send_invitations': {'queue': 'bulk'},
}
```

### Redis Cluster Configuration

**File:** `/app/backend/config/kubernetes/redis-cluster.yaml`

- **6 nodes:** 3 masters + 3 replicas
- **Memory:** 2GB per node (12GB total)
- **Persistence:** RDB + AOF
- **Eviction:** allkeys-lru

---

## 3. Database Optimizations (MongoDB)

### Sharded Cluster

**File:** `/app/backend/config/kubernetes/mongodb-sharded.yaml`

| Component | Nodes | Resources |
|-----------|-------|-----------|
| Config Servers | 3 | 1Gi RAM, 10Gi disk |
| Shard 1 | 3 (RS) | 4Gi RAM, 100Gi disk |
| Shard 2 | 3 (RS) | 4Gi RAM, 100Gi disk |
| Shard 3 | 3 (RS) | 4Gi RAM, 100Gi disk |
| Mongos Routers | 3-10 | 1Gi RAM |

### Shard Keys

```javascript
// Responses - Hash for even distribution
db.survey360_responses.createIndex({ survey_id: "hashed" })

// Surveys - Range for tenant queries
db.survey360_surveys.createIndex({ org_id: 1, created_at: 1 })
```

### Time-Series Collections

**File:** `/app/backend/utils/high_throughput_db.py`

```python
# Optimized for high-volume submissions
await db.create_collection(
    "survey360_responses_ts",
    timeseries={
        "timeField": "submitted_at",
        "metaField": "meta",
        "granularity": "seconds"
    }
)
```

**Benefits:**
- Automatic data bucketing
- 10x storage compression
- Optimized time-range queries
- Efficient aggregations

### Write Concerns

| Operation | Write Concern | Use Case |
|-----------|---------------|----------|
| Fast submissions | w=1, j=false | Real-time ingestion |
| Safe writes | w=majority, j=true | Critical data |
| Bulk imports | w=1, wtimeout=5000 | High-volume imports |

### Connection Pooling

```python
MAX_POOL_SIZE = 200    # Maximum connections
MIN_POOL_SIZE = 50     # Keep-alive connections
MAX_IDLE_TIME_MS = 60000
```

---

## 4. High-Throughput Submission API

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/survey360/submissions/{id}` | POST | Single submission |
| `/api/survey360/submissions/{id}/bulk` | POST | Bulk (up to 10K) |
| `/api/survey360/submissions/metrics` | GET | Real-time metrics |
| `/api/survey360/submissions/health` | GET | System health |
| `/api/survey360/submissions/flush` | POST | Force flush buffer |

### Submission Buffer

```python
class SubmissionBuffer:
    max_size = 1000      # Flush when 1000 submissions buffered
    flush_interval = 1.0  # Auto-flush every 1 second
```

### Priority Levels

```python
# Example submission with priority
POST /api/survey360/submissions/{survey_id}
{
    "responses": {"q1": "answer1"},
    "priority": "critical"  # critical, high, normal, low
}
```

---

## 5. Deployment Commands

### Deploy to Kubernetes

```bash
# Create namespace
kubectl create namespace survey360

# Create secrets
kubectl create secret generic survey360-secrets \
  --from-literal=mongo-url="mongodb://..." \
  --from-literal=redis-url="redis://..." \
  --from-literal=redis-password="..." \
  -n survey360

# Deploy Redis Cluster
kubectl apply -f /app/backend/config/kubernetes/redis-cluster.yaml -n survey360

# Deploy MongoDB Sharded Cluster
kubectl apply -f /app/backend/config/kubernetes/mongodb-sharded.yaml -n survey360

# Deploy Application
kubectl apply -f /app/backend/config/kubernetes/deployment.yaml -n survey360

# Initialize MongoDB sharding
kubectl exec -it mongodb-mongos-0 -n survey360 -- mongosh --eval "
  sh.enableSharding('survey360');
  sh.shardCollection('survey360.survey360_responses', { survey_id: 'hashed' });
"
```

### Initialize Database

```bash
# Call initialization endpoint
curl -X POST https://api.survey360.io/api/survey360/submissions/init-db
```

---

## 6. Capacity Planning

### For 500,000 Concurrent Submissions

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| API Pods | 20 | 30-50 |
| Celery Workers | 25 | 40-50 |
| Redis Memory | 8GB | 12GB |
| MongoDB Shards | 3 | 3-5 |
| Mongos Routers | 5 | 8-10 |

### Throughput Estimates

| Metric | Value |
|--------|-------|
| API requests/sec | 50,000-100,000 |
| DB writes/sec | 20,000-50,000 |
| Queue processing/sec | 10,000 |
| Max concurrent submissions | 500,000+ |

---

## 7. Monitoring

### Metrics to Watch

1. **API Pods:**
   - CPU/Memory utilization
   - Request latency (p99 < 200ms)
   - Error rate (< 0.1%)

2. **Celery:**
   - Queue depth per queue
   - Task success rate
   - Worker utilization

3. **Redis:**
   - Memory usage
   - Connection count
   - Cache hit rate

4. **MongoDB:**
   - Op counters
   - Replication lag
   - Lock percentage

### Dashboards

- **Flower:** Celery monitoring at port 5555
- **Prometheus/Grafana:** System metrics
- **MongoDB Atlas:** Database monitoring

---

## 8. Files Reference

| File | Purpose |
|------|---------|
| `config/kubernetes/deployment.yaml` | API & Celery K8s deployment |
| `config/kubernetes/redis-cluster.yaml` | Redis cluster setup |
| `config/kubernetes/mongodb-sharded.yaml` | MongoDB sharded cluster |
| `utils/celery_app.py` | Celery configuration with priority queues |
| `utils/submission_processor.py` | High-throughput submission processing |
| `utils/high_throughput_db.py` | Database optimizations |
| `routes/submission_routes.py` | Submission API endpoints |

---

## 9. Cost Estimates (AWS)

| Component | Instance Type | Count | Monthly Cost |
|-----------|--------------|-------|--------------|
| API Pods | m5.large | 30 | ~$2,400 |
| Celery Workers | c5.xlarge | 40 | ~$4,800 |
| Redis Cluster | r5.large | 6 | ~$900 |
| MongoDB (Atlas) | M30 | 9 | ~$5,400 |
| Load Balancer | NLB | 1 | ~$200 |
| **Total** | | | **~$13,700/mo** |

---

## 10. Future Optimizations

- [ ] Kafka for event streaming (higher throughput)
- [ ] ClickHouse for analytics (faster queries)
- [ ] CDN for static assets
- [ ] Multi-region deployment
- [ ] Serverless functions for spikes
