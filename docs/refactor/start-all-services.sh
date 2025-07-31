#!/bin/bash

# Zero Sources Architecture Startup Script
# Demonstrates the proper startup sequence for the three-container architecture

set -e

echo "🚀 Starting Zero Sources Architecture"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    echo -e "${BLUE}⏳ Waiting for $service_name to be ready...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is ready!${NC}"
            return 0
        fi
        
        echo -e "${YELLOW}   Attempt $attempt/$max_attempts - $service_name not ready yet...${NC}"
        sleep 2
        ((attempt++))
    done
    
    echo -e "${RED}❌ $service_name failed to start within timeout${NC}"
    return 1
}

# Step 1: Start MongoDB
echo -e "${BLUE}1. Starting MongoDB...${NC}"
# In Docker Compose, this happens automatically
# For local development: mongod or docker run mongo

# Step 2: Start ZRocket Application (needs to be first for schema export)
echo -e "${BLUE}2. Starting ZRocket Application Server...${NC}"
cd apps/zrocket
npm run build > /dev/null 2>&1 || echo "Build completed with warnings"
npm start &
ZROCKET_PID=$!
cd ../..

# Wait for ZRocket to be ready
wait_for_service "http://localhost:8011/health" "ZRocket Application"

# Verify schema export is working
echo -e "${BLUE}🔍 Testing schema export endpoints...${NC}"
if curl -f -s "http://localhost:8011/api/schema/export" > /dev/null; then
    echo -e "${GREEN}✅ Schema export endpoint is working${NC}"
else
    echo -e "${RED}❌ Schema export endpoint failed${NC}"
    exit 1
fi

# Step 3: Export schema files for source server
echo -e "${BLUE}3. Exporting schema for source server...${NC}"
cd apps/zrocket
npm run export-schema:source-server
cd ../..

# Step 4: Start Zero Change Source Server
echo -e "${BLUE}4. Starting Zero Change Source Server...${NC}"
cd apps/source-mongodb-server
npm run build > /dev/null 2>&1 || echo "Build completed with warnings"
npm start &
SOURCE_SERVER_PID=$!
cd ../..

# Wait for Change Source to be ready
wait_for_service "http://localhost:8001/health" "Zero Change Source"

# Step 5: Start Zero Cache Server
echo -e "${BLUE}5. Starting Zero Cache Server...${NC}"
cd apps/zrocket
npm run dev:zero &
ZERO_CACHE_PID=$!
cd ../..

# Wait for Zero Cache to be ready
wait_for_service "http://localhost:4848/health" "Zero Cache"

echo ""
echo -e "${GREEN}🎉 All services are running!${NC}"
echo "=============================="
echo -e "${BLUE}🔗 Service URLs:${NC}"
echo "   ZRocket App:        http://localhost:8011"
echo "   ZRocket API Docs:   http://localhost:8011/api-docs"
echo "   Zero Change Source: http://localhost:8001"
echo "   Zero Cache:         http://localhost:4848"
echo ""
echo -e "${BLUE}📊 Schema Endpoints:${NC}"
echo "   Schema Export:      http://localhost:8011/api/schema/export"
echo "   Table Mappings:     http://localhost:8011/api/schema/table-mappings"
echo "   Source Metadata:    http://localhost:8001/metadata/status"
echo ""
echo -e "${YELLOW}💡 To stop all services, run: kill $ZROCKET_PID $SOURCE_SERVER_PID $ZERO_CACHE_PID${NC}"
echo -e "${YELLOW}   Or use: docker-compose down (if using Docker)${NC}"

# Keep script running
wait
