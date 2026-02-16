#!/bin/bash
# MongoDB Collection Sharding Configuration for Survey360
# Run this after the cluster is initialized
#
# Usage: kubectl exec -it mongos-0 -n survey360 -- bash /scripts/init-collections.sh

set -e

MONGOS_HOST="mongos-0.mongos.survey360.svc.cluster.local:27017"
DB_NAME="survey360"

echo "============================================"
echo "Survey360 Collection Sharding Configuration"
echo "============================================"

# Enable sharding on database
echo "Enabling sharding on database: $DB_NAME"
mongosh --host $MONGOS_HOST --eval "sh.enableSharding('$DB_NAME')"

# ============================================
# SURVEY RESPONSES - High volume, hash sharded
# ============================================
echo "Configuring survey360_responses collection..."
mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;

// Create indexes first
db.survey360_responses.createIndex({ survey_id: 'hashed' });
db.survey360_responses.createIndex({ survey_id: 1, submitted_at: -1 });
db.survey360_responses.createIndex({ respondent_id: 1 });
db.survey360_responses.createIndex({ status: 1, submitted_at: -1 });

// Shard the collection
sh.shardCollection('$DB_NAME.survey360_responses', { survey_id: 'hashed' });
"

# ============================================
# TIME-SERIES RESPONSES - For analytics
# ============================================
echo "Configuring survey360_responses_ts collection..."
mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;

// Create time-series collection if not exists
try {
  db.createCollection('survey360_responses_ts', {
    timeseries: {
      timeField: 'submitted_at',
      metaField: 'meta',
      granularity: 'seconds'
    }
  });
} catch(e) {
  print('Time-series collection may already exist');
}

// Shard by meta.survey_id for distribution
sh.shardCollection('$DB_NAME.survey360_responses_ts', { 'meta.survey_id': 'hashed' });
"

# ============================================
# SURVEYS - Range sharded by org_id for tenant isolation
# ============================================
echo "Configuring survey360_surveys collection..."
mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;

// Create indexes
db.survey360_surveys.createIndex({ org_id: 1, created_at: -1 });
db.survey360_surveys.createIndex({ id: 1 }, { unique: true });
db.survey360_surveys.createIndex({ user_id: 1, status: 1 });
db.survey360_surveys.createIndex({ status: 1, created_at: -1 });

// Shard by org_id (range) for tenant queries
sh.shardCollection('$DB_NAME.survey360_surveys', { org_id: 1 });
"

# ============================================
# USERS - Hash sharded for even distribution
# ============================================
echo "Configuring survey360_users collection..."
mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;

// Create indexes
db.survey360_users.createIndex({ email: 1 }, { unique: true });
db.survey360_users.createIndex({ id: 1 }, { unique: true });
db.survey360_users.createIndex({ org_id: 1 });

// Shard by org_id (hashed)
sh.shardCollection('$DB_NAME.survey360_users', { org_id: 'hashed' });
"

# ============================================
# ANALYTICS EVENTS - Time-series for monitoring
# ============================================
echo "Configuring survey360_analytics_events collection..."
mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;

try {
  db.createCollection('survey360_analytics_events', {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'event_meta',
      granularity: 'minutes'
    },
    expireAfterSeconds: 7776000  // 90 days retention
  });
} catch(e) {
  print('Analytics events collection may already exist');
}

sh.shardCollection('$DB_NAME.survey360_analytics_events', { 'event_meta.survey_id': 'hashed' });
"

# ============================================
# SUBMISSIONS BUFFER - For high-throughput ingestion
# ============================================
echo "Configuring survey360_submissions_buffer collection..."
mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;

db.survey360_submissions_buffer.createIndex({ survey_id: 'hashed' });
db.survey360_submissions_buffer.createIndex({ created_at: 1 }, { expireAfterSeconds: 3600 }); // TTL 1 hour

sh.shardCollection('$DB_NAME.survey360_submissions_buffer', { survey_id: 'hashed' });
"

# ============================================
# HELP ASSISTANT DATA
# ============================================
echo "Configuring help assistant collections..."
mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;

// Sessions
db.help_assistant_sessions.createIndex({ user_id: 1, created_at: -1 });
db.help_assistant_sessions.createIndex({ session_id: 1 }, { unique: true });

// Messages (high volume)
db.help_assistant_messages.createIndex({ session_id: 'hashed' });
db.help_assistant_messages.createIndex({ session_id: 1, timestamp: -1 });
sh.shardCollection('$DB_NAME.help_assistant_messages', { session_id: 'hashed' });

// Feedback
db.help_assistant_feedback.createIndex({ message_id: 1 });
db.help_assistant_feedback.createIndex({ created_at: -1 });
"

# ============================================
# VERIFY SHARDING STATUS
# ============================================
echo ""
echo "============================================"
echo "Verifying sharding configuration..."
echo "============================================"

mongosh --host $MONGOS_HOST --eval "
use $DB_NAME;
db.printShardingStatus();
"

echo ""
echo "============================================"
echo "Collection sharding configured successfully!"
echo "============================================"
echo ""
echo "Sharded collections:"
echo "  - survey360_responses (hash: survey_id)"
echo "  - survey360_responses_ts (hash: meta.survey_id)"
echo "  - survey360_surveys (range: org_id)"
echo "  - survey360_users (hash: org_id)"
echo "  - survey360_analytics_events (hash: event_meta.survey_id)"
echo "  - survey360_submissions_buffer (hash: survey_id)"
echo "  - help_assistant_messages (hash: session_id)"
echo ""
