#!/bin/bash
# MongoDB Sharding Initialization Script
# Run this after all MongoDB pods are running
#
# Usage: kubectl exec -it mongos-0 -n survey360 -- bash /scripts/init-sharding.sh

set -e

echo "============================================"
echo "Survey360 MongoDB Sharding Initialization"
echo "============================================"

# Wait for config servers
echo "Waiting for config servers..."
sleep 10

# Initialize Config Server Replica Set
echo "Initializing Config Server Replica Set..."
mongosh --host mongo-configsvr-0.mongo-configsvr.survey360.svc.cluster.local:27019 --eval '
rs.initiate({
  _id: "configRS",
  configsvr: true,
  members: [
    { _id: 0, host: "mongo-configsvr-0.mongo-configsvr.survey360.svc.cluster.local:27019" },
    { _id: 1, host: "mongo-configsvr-1.mongo-configsvr.survey360.svc.cluster.local:27019" },
    { _id: 2, host: "mongo-configsvr-2.mongo-configsvr.survey360.svc.cluster.local:27019" }
  ]
})
' || echo "Config RS may already be initialized"

sleep 5

# Initialize Shard 1 Replica Set
echo "Initializing Shard 1 Replica Set..."
mongosh --host mongo-shard1-0.mongo-shard1.survey360.svc.cluster.local:27018 --eval '
rs.initiate({
  _id: "shard1RS",
  members: [
    { _id: 0, host: "mongo-shard1-0.mongo-shard1.survey360.svc.cluster.local:27018" },
    { _id: 1, host: "mongo-shard1-1.mongo-shard1.survey360.svc.cluster.local:27018" },
    { _id: 2, host: "mongo-shard1-2.mongo-shard1.survey360.svc.cluster.local:27018" }
  ]
})
' || echo "Shard 1 RS may already be initialized"

# Initialize Shard 2 Replica Set
echo "Initializing Shard 2 Replica Set..."
mongosh --host mongo-shard2-0.mongo-shard2.survey360.svc.cluster.local:27018 --eval '
rs.initiate({
  _id: "shard2RS",
  members: [
    { _id: 0, host: "mongo-shard2-0.mongo-shard2.survey360.svc.cluster.local:27018" },
    { _id: 1, host: "mongo-shard2-1.mongo-shard2.survey360.svc.cluster.local:27018" },
    { _id: 2, host: "mongo-shard2-2.mongo-shard2.survey360.svc.cluster.local:27018" }
  ]
})
' || echo "Shard 2 RS may already be initialized"

# Initialize Shard 3 Replica Set
echo "Initializing Shard 3 Replica Set..."
mongosh --host mongo-shard3-0.mongo-shard3.survey360.svc.cluster.local:27018 --eval '
rs.initiate({
  _id: "shard3RS",
  members: [
    { _id: 0, host: "mongo-shard3-0.mongo-shard3.survey360.svc.cluster.local:27018" },
    { _id: 1, host: "mongo-shard3-1.mongo-shard3.survey360.svc.cluster.local:27018" },
    { _id: 2, host: "mongo-shard3-2.mongo-shard3.survey360.svc.cluster.local:27018" }
  ]
})
' || echo "Shard 3 RS may already be initialized"

echo "Waiting for replica sets to stabilize..."
sleep 30

# Add Shards to Cluster (run on mongos)
echo "Adding shards to cluster..."
mongosh --host mongos-0.mongos.survey360.svc.cluster.local:27017 --eval '
sh.addShard("shard1RS/mongo-shard1-0.mongo-shard1.survey360.svc.cluster.local:27018,mongo-shard1-1.mongo-shard1.survey360.svc.cluster.local:27018,mongo-shard1-2.mongo-shard1.survey360.svc.cluster.local:27018");
sh.addShard("shard2RS/mongo-shard2-0.mongo-shard2.survey360.svc.cluster.local:27018,mongo-shard2-1.mongo-shard2.survey360.svc.cluster.local:27018,mongo-shard2-2.mongo-shard2.survey360.svc.cluster.local:27018");
sh.addShard("shard3RS/mongo-shard3-0.mongo-shard3.survey360.svc.cluster.local:27018,mongo-shard3-1.mongo-shard3.survey360.svc.cluster.local:27018,mongo-shard3-2.mongo-shard3.survey360.svc.cluster.local:27018");
'

echo "Verifying shards..."
mongosh --host mongos-0.mongos.survey360.svc.cluster.local:27017 --eval 'sh.status()'

echo "============================================"
echo "Sharding cluster initialized successfully!"
echo "============================================"
