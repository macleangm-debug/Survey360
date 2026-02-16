#!/bin/bash
# Survey360 Kubernetes Deployment Script
# Deploys the complete stack to a Kubernetes cluster
#
# Prerequisites:
#   - kubectl configured with cluster access
#   - Docker images built and pushed to registry
#   - Storage class 'standard' available (or modify manifests)
#   - cert-manager installed for TLS
#
# Usage:
#   ./deploy.sh [command]
#
# Commands:
#   deploy      - Deploy entire stack
#   destroy     - Remove all resources
#   status      - Show deployment status
#   logs        - Show recent logs
#   init-db     - Initialize MongoDB sharding
#   monitoring  - Deploy Prometheus + Grafana
#   tls         - Configure Let's Encrypt certificates

set -e

NAMESPACE="survey360"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

deploy() {
    log_info "Starting Survey360 deployment..."
    
    # 1. Create namespace and base resources
    log_info "Creating namespace and base resources..."
    kubectl apply -f "$SCRIPT_DIR/base/namespace.yaml"
    kubectl apply -f "$SCRIPT_DIR/base/configmap.yaml"
    kubectl apply -f "$SCRIPT_DIR/base/secrets.yaml"
    
    # 2. Deploy MongoDB Sharded Cluster
    log_info "Deploying MongoDB sharded cluster..."
    kubectl apply -f "$SCRIPT_DIR/mongodb/statefulset.yaml"
    
    log_info "Waiting for MongoDB pods to be ready (this may take a few minutes)..."
    kubectl wait --for=condition=ready pod -l app=mongo-configsvr -n $NAMESPACE --timeout=300s || true
    kubectl wait --for=condition=ready pod -l app=mongo-shard1 -n $NAMESPACE --timeout=300s || true
    kubectl wait --for=condition=ready pod -l app=mongo-shard2 -n $NAMESPACE --timeout=300s || true
    kubectl wait --for=condition=ready pod -l app=mongo-shard3 -n $NAMESPACE --timeout=300s || true
    kubectl wait --for=condition=ready pod -l app=mongos -n $NAMESPACE --timeout=300s || true
    
    # 3. Deploy Redis
    log_info "Deploying Redis..."
    kubectl apply -f "$SCRIPT_DIR/redis/statefulset.yaml"
    kubectl wait --for=condition=ready pod -l app=redis -n $NAMESPACE --timeout=120s || true
    
    # 4. Deploy Backend
    log_info "Deploying Backend..."
    kubectl apply -f "$SCRIPT_DIR/backend/deployment.yaml"
    
    # 5. Deploy Celery Workers
    log_info "Deploying Celery workers..."
    kubectl apply -f "$SCRIPT_DIR/celery/deployment.yaml"
    
    # 6. Deploy Frontend
    log_info "Deploying Frontend..."
    kubectl apply -f "$SCRIPT_DIR/frontend/deployment.yaml"
    
    # 7. Deploy Ingress
    log_info "Deploying Ingress..."
    kubectl apply -f "$SCRIPT_DIR/ingress/ingress.yaml"
    
    log_success "Deployment complete!"
    log_info "Run './deploy.sh init-db' to initialize MongoDB sharding"
    log_info "Run './deploy.sh status' to check deployment status"
}

init_db() {
    log_info "Initializing MongoDB sharding..."
    
    # Wait for mongos to be ready
    kubectl wait --for=condition=ready pod mongos-0 -n $NAMESPACE --timeout=120s
    
    # Copy and run initialization scripts
    log_info "Initializing cluster..."
    kubectl cp "$SCRIPT_DIR/mongodb/init-cluster.sh" $NAMESPACE/mongos-0:/tmp/init-cluster.sh
    kubectl exec -it mongos-0 -n $NAMESPACE -- bash /tmp/init-cluster.sh
    
    log_info "Configuring collections..."
    kubectl cp "$SCRIPT_DIR/mongodb/init-collections.sh" $NAMESPACE/mongos-0:/tmp/init-collections.sh
    kubectl exec -it mongos-0 -n $NAMESPACE -- bash /tmp/init-collections.sh
    
    log_success "MongoDB sharding initialized!"
}

destroy() {
    log_warn "This will delete all Survey360 resources including data!"
    read -p "Are you sure? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        log_info "Aborted."
        exit 0
    fi
    
    log_info "Destroying Survey360 deployment..."
    
    kubectl delete -f "$SCRIPT_DIR/ingress/ingress.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/frontend/deployment.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/celery/deployment.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/backend/deployment.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/redis/statefulset.yaml" --ignore-not-found
    kubectl delete -f "$SCRIPT_DIR/mongodb/statefulset.yaml" --ignore-not-found
    
    # Delete PVCs
    log_info "Deleting persistent volume claims..."
    kubectl delete pvc --all -n $NAMESPACE --ignore-not-found
    
    # Delete namespace (optional)
    read -p "Delete namespace and all remaining resources? (yes/no): " del_ns
    if [ "$del_ns" == "yes" ]; then
        kubectl delete namespace $NAMESPACE --ignore-not-found
    fi
    
    log_success "Cleanup complete!"
}

status() {
    log_info "Survey360 Deployment Status"
    echo ""
    
    echo "=== Pods ==="
    kubectl get pods -n $NAMESPACE -o wide
    echo ""
    
    echo "=== Services ==="
    kubectl get svc -n $NAMESPACE
    echo ""
    
    echo "=== HPAs ==="
    kubectl get hpa -n $NAMESPACE
    echo ""
    
    echo "=== Ingresses ==="
    kubectl get ingress -n $NAMESPACE
    echo ""
    
    echo "=== PVCs ==="
    kubectl get pvc -n $NAMESPACE
}

logs() {
    local component=${1:-backend}
    log_info "Showing logs for $component..."
    kubectl logs -l app=$component -n $NAMESPACE --tail=100 -f
}

scale() {
    local component=$1
    local replicas=$2
    
    if [ -z "$component" ] || [ -z "$replicas" ]; then
        log_error "Usage: ./deploy.sh scale <component> <replicas>"
        exit 1
    fi
    
    log_info "Scaling $component to $replicas replicas..."
    kubectl scale deployment/$component --replicas=$replicas -n $NAMESPACE
    log_success "Scaled $component to $replicas"
}

monitoring() {
    log_info "Deploying monitoring stack (Prometheus + Grafana)..."
    
    kubectl apply -f "$SCRIPT_DIR/monitoring/prometheus.yaml"
    kubectl apply -f "$SCRIPT_DIR/monitoring/grafana.yaml"
    kubectl apply -f "$SCRIPT_DIR/monitoring/alertmanager.yaml"
    
    log_info "Waiting for monitoring pods..."
    kubectl wait --for=condition=ready pod -l app=prometheus -n monitoring --timeout=120s || true
    kubectl wait --for=condition=ready pod -l app=grafana -n monitoring --timeout=120s || true
    
    log_success "Monitoring stack deployed!"
    echo ""
    echo "Access URLs:"
    echo "  Prometheus: kubectl port-forward svc/prometheus 9090:9090 -n monitoring"
    echo "  Grafana:    kubectl port-forward svc/grafana 3000:3000 -n monitoring"
    echo "  Grafana credentials: admin / survey360grafana"
}

tls() {
    log_info "Setting up TLS with Let's Encrypt..."
    
    # Install cert-manager if not present
    log_info "Checking cert-manager..."
    if ! kubectl get namespace cert-manager &>/dev/null; then
        log_info "Installing cert-manager..."
        kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml
        
        log_info "Waiting for cert-manager..."
        kubectl wait --for=condition=ready pod -l app=cert-manager -n cert-manager --timeout=120s
        kubectl wait --for=condition=ready pod -l app=webhook -n cert-manager --timeout=120s
    fi
    
    # Apply cluster issuers and certificates
    kubectl apply -f "$SCRIPT_DIR/cert-manager/certificates.yaml"
    
    log_success "TLS configuration applied!"
    echo ""
    echo "Check certificate status:"
    echo "  kubectl get certificates -n survey360"
    echo "  kubectl describe certificate survey360-tls -n survey360"
}

cdn_info() {
    log_info "Cloudflare CDN Configuration Guide"
    echo ""
    echo "============================================"
    echo "CLOUDFLARE SETUP INSTRUCTIONS"
    echo "============================================"
    echo ""
    echo "1. Add your domain to Cloudflare"
    echo "2. Update nameservers at your registrar"
    echo "3. Add DNS records:"
    echo "   - A record: survey360.yourdomain.com → <Load Balancer IP>"
    echo "   - CNAME: api.survey360.yourdomain.com → survey360.yourdomain.com"
    echo "   - Enable orange cloud (proxied) for CDN benefits"
    echo ""
    echo "4. SSL/TLS Settings:"
    echo "   - Mode: Full (Strict)"
    echo "   - Always Use HTTPS: ON"
    echo "   - Minimum TLS: 1.2"
    echo ""
    echo "5. Page Rules (in order):"
    echo "   - *yourdomain.com/api/* → Cache Level: Bypass"
    echo "   - *yourdomain.com/static/* → Cache Everything, Edge TTL: 1 month"
    echo "   - *yourdomain.com/* → Standard caching"
    echo ""
    echo "See k8s/cdn/cloudflare-config.yaml for detailed configuration"
}

# Main
case "${1:-deploy}" in
    deploy)
        deploy
        ;;
    destroy)
        destroy
        ;;
    status)
        status
        ;;
    logs)
        logs "$2"
        ;;
    scale)
        scale "$2" "$3"
        ;;
    init-db)
        init_db
        ;;
    monitoring)
        monitoring
        ;;
    tls)
        tls
        ;;
    cdn)
        cdn_info
        ;;
    *)
        echo "Usage: $0 {deploy|destroy|status|logs|scale|init-db|monitoring|tls|cdn}"
        exit 1
        ;;
esac
