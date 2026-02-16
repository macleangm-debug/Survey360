# Survey360 Kubernetes Deployment Guide

## Overview

This directory contains production-ready Kubernetes manifests for deploying Survey360 with:
- **MongoDB Sharded Cluster** (3 shards, 14 pods total) for multi-million record scale
- **Redis** with persistence for caching and Celery broker
- **FastAPI Backend** with HPA (3-50 pods)
- **React Frontend** with Nginx
- **Celery Workers** with priority queues (critical, default, bulk)
- **Ingress** with SSL/TLS termination

## Architecture

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                    KUBERNETES CLUSTER                        │
                    │                                                              │
    Internet        │   ┌───────────────────────────────────────────────────┐     │
        │           │   │              NGINX INGRESS CONTROLLER              │     │
        └──────────►│   └─────────────────────┬─────────────────────────────┘     │
                    │                         │                                    │
                    │         ┌───────────────┴───────────────┐                   │
                    │         │                               │                    │
                    │         ▼                               ▼                    │
                    │   ┌───────────┐                 ┌───────────────┐           │
                    │   │ FRONTEND  │                 │    BACKEND    │           │
                    │   │  (2-10)   │                 │    (3-50)     │           │
                    │   │   Nginx   │                 │    FastAPI    │           │
                    │   └───────────┘                 └───────┬───────┘           │
                    │                                         │                    │
                    │         ┌───────────────────────────────┼───────────────┐   │
                    │         │                               │               │   │
                    │         ▼                               ▼               ▼   │
                    │   ┌───────────┐                 ┌───────────┐   ┌─────────┐│
                    │   │   REDIS   │◄───────────────►│  CELERY   │   │ FLOWER  ││
                    │   │  (1 pod)  │                 │  WORKERS  │   │  (1)    ││
                    │   └───────────┘                 │  (7-55)   │   └─────────┘│
                    │                                 └─────┬─────┘              │
                    │                                       │                     │
                    │                                       ▼                     │
                    │   ┌─────────────────────────────────────────────────────┐  │
                    │   │              MONGODB SHARDED CLUSTER                 │  │
                    │   │                                                      │  │
                    │   │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
                    │   │  │ CONFIG   │  │  MONGOS  │  │  MONGOS  │           │  │
                    │   │  │ SERVERS  │  │  (2-10)  │  │  (2-10)  │           │  │
                    │   │  │   (3)    │  └────┬─────┘  └────┬─────┘           │  │
                    │   │  └──────────┘       │             │                  │  │
                    │   │                     ▼             ▼                  │  │
                    │   │  ┌──────────┐  ┌──────────┐  ┌──────────┐           │  │
                    │   │  │ SHARD 1  │  │ SHARD 2  │  │ SHARD 3  │           │  │
                    │   │  │  (3 RS)  │  │  (3 RS)  │  │  (3 RS)  │           │  │
                    │   │  └──────────┘  └──────────┘  └──────────┘           │  │
                    │   └─────────────────────────────────────────────────────┘  │
                    └─────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
k8s/
├── base/
│   ├── namespace.yaml      # Namespace with resource quotas
│   ├── configmap.yaml      # Non-sensitive configuration
│   └── secrets.yaml        # Sensitive credentials
├── mongodb/
│   ├── statefulset.yaml    # Sharded cluster (14 pods)
│   ├── init-cluster.sh     # Cluster initialization script
│   └── init-collections.sh # Collection sharding script
├── redis/
│   └── statefulset.yaml    # Redis with persistence
├── backend/
│   └── deployment.yaml     # FastAPI + HPA + PDB
├── frontend/
│   └── deployment.yaml     # Nginx + HPA + PDB
├── celery/
│   └── deployment.yaml     # Workers (critical, default, bulk) + Beat + Flower
├── ingress/
│   └── ingress.yaml        # Nginx Ingress + Network Policies
├── deploy.sh               # Deployment automation script
└── README.md               # This file
```

## Prerequisites

1. **Kubernetes Cluster** (1.25+)
   - EKS, GKE, AKS, or self-managed
   - Minimum: 6 nodes, 4 vCPU, 16GB RAM each

2. **kubectl** configured with cluster access

3. **Storage Class** named `standard` (or modify manifests)

4. **Nginx Ingress Controller**
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.0/deploy/static/provider/cloud/deploy.yaml
   ```

5. **Cert-Manager** (for automatic TLS)
   ```bash
   kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
   ```

## Quick Start

### 1. Build and Push Docker Images

```bash
# Backend
docker build -t your-registry/survey360-backend:latest ./backend
docker push your-registry/survey360-backend:latest

# Frontend
docker build -t your-registry/survey360-frontend:latest ./frontend
docker push your-registry/survey360-frontend:latest
```

### 2. Update Configuration

Edit `base/secrets.yaml`:
- Set your `EMERGENT_LLM_KEY`
- Update `JWT_SECRET`

Edit `ingress/ingress.yaml`:
- Replace `survey360.yourdomain.com` with your domain

### 3. Deploy

```bash
chmod +x deploy.sh
./deploy.sh deploy
```

### 4. Initialize MongoDB Sharding

```bash
./deploy.sh init-db
```

### 5. Verify Deployment

```bash
./deploy.sh status
```

## Sharding Configuration

### Shard Keys

| Collection | Shard Key | Strategy |
|------------|-----------|----------|
| survey360_responses | `survey_id` | Hashed (even distribution) |
| survey360_responses_ts | `meta.survey_id` | Hashed |
| survey360_surveys | `org_id` | Range (tenant isolation) |
| survey360_users | `org_id` | Hashed |
| survey360_analytics_events | `event_meta.survey_id` | Hashed |
| help_assistant_messages | `session_id` | Hashed |

### Capacity

With 3 shards:
- **Storage**: ~300GB (100GB per shard)
- **Write throughput**: 50,000+ ops/sec
- **Records**: 100+ million documents

## Scaling

### Manual Scaling

```bash
# Scale backend
./deploy.sh scale backend 10

# Scale celery workers
./deploy.sh scale celery-worker-critical 10
```

### Auto-Scaling (HPA)

| Component | Min | Max | Scale Trigger |
|-----------|-----|-----|---------------|
| backend | 3 | 50 | CPU 70%, Memory 80% |
| frontend | 2 | 10 | CPU 70% |
| celery-worker-critical | 3 | 30 | CPU 60% |
| celery-worker-default | 2 | 15 | CPU 70% |
| celery-worker-bulk | 2 | 10 | CPU 80% |
| mongos | 2 | 10 | CPU 70%, Memory 80% |

## Monitoring

### Flower Dashboard

Access Celery monitoring at: `https://flower.survey360.yourdomain.com`
- Default credentials: `admin:survey360flower`

### Prometheus Metrics

Pods are annotated for Prometheus scraping:
- Backend: `/api/metrics` on port 8001
- Redis Exporter: port 9121

### Logs

```bash
# All backend logs
./deploy.sh logs backend

# Celery worker logs
./deploy.sh logs celery-worker-critical
```

## Backup & Restore

### MongoDB Backup

```bash
# Create backup job
kubectl exec -it mongos-0 -n survey360 -- mongodump --out /data/backup

# Copy to local
kubectl cp survey360/mongos-0:/data/backup ./mongodb-backup
```

### Redis Backup

Redis automatically persists via RDB + AOF. Data is stored in PVC `data-redis-0`.

## Troubleshooting

### MongoDB Issues

```bash
# Check shard status
kubectl exec -it mongos-0 -n survey360 -- mongosh --eval "sh.status()"

# Check replica set status
kubectl exec -it mongo-shard1-0 -n survey360 -- mongosh --port 27018 --eval "rs.status()"
```

### Celery Issues

```bash
# Check active tasks
kubectl exec -it $(kubectl get pod -l app=celery-worker -n survey360 -o jsonpath='{.items[0].metadata.name}') -n survey360 -- celery -A utils.celery_app inspect active
```

### Scaling Issues

```bash
# Check HPA status
kubectl describe hpa backend-hpa -n survey360

# Check events
kubectl get events -n survey360 --sort-by='.lastTimestamp'
```

## Cost Estimates (AWS)

| Component | Instance Type | Count | Monthly Cost |
|-----------|--------------|-------|--------------|
| Worker Nodes | m5.xlarge | 6 | ~$1,200 |
| MongoDB PVCs | gp3 | 12 × 100GB | ~$240 |
| Redis PVC | gp3 | 10GB | ~$10 |
| Load Balancer | NLB | 1 | ~$20 |
| **Total** | | | **~$1,470/mo** |

*For 500K+ submissions, scale to 10-15 nodes (~$3,000/mo)*

## Production Checklist

- [ ] Configure external DNS for domains
- [ ] Set up SSL certificates (Let's Encrypt via cert-manager)
- [ ] Configure monitoring (Prometheus + Grafana)
- [ ] Set up log aggregation (ELK/Loki)
- [ ] Configure backup strategy
- [ ] Set up alerting
- [ ] Review and adjust resource limits
- [ ] Configure pod security policies
- [ ] Enable network policies
- [ ] Set up CI/CD pipeline for deployments
