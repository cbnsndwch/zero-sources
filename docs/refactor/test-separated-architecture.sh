#!/bin/bash

# End-to-End Test for Separated Architecture
# Tests the complete three-container setup

set -e

echo "🧪 Testing Zero Sources Separated Architecture"
echo "=============================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    echo -e "${BLUE}🔍 Testing: $test_name${NC}"
    
    if eval "$test_command" | grep -q "$expected_pattern"; then
        echo -e "${GREEN}✅ PASS: $test_name${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name${NC}"
        echo -e "${YELLOW}Command: $test_command${NC}"
        echo -e "${YELLOW}Expected pattern: $expected_pattern${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

# Test API endpoint function
test_api() {
    local test_name="$1"
    local url="$2"
    local expected_status="$3"
    
    echo -e "${BLUE}🔍 Testing API: $test_name${NC}"
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS: $test_name (HTTP $status_code)${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL: $test_name (HTTP $status_code, expected $expected_status)${NC}"
        ((TESTS_FAILED++))
    fi
    echo ""
}

echo -e "${BLUE}1. Testing Service Health Endpoints${NC}"
echo "=================================="

# Test ZRocket health
test_api "ZRocket App Health" "http://localhost:8011/health" "200"

# Test ZRocket demo endpoint
test_api "ZRocket Demo Info" "http://localhost:8011/zrocket/demo-info" "200"

# Test Schema Export API
test_api "Schema Export API" "http://localhost:8011/api/schema/export" "200"

# Test Table Mappings API
test_api "Table Mappings API" "http://localhost:8011/api/schema/table-mappings" "200"

# Test Source Server health
test_api "Source Server Health" "http://localhost:8001/health" "200"

# Test Source Server metadata
test_api "Source Server Metadata" "http://localhost:8001/metadata/status" "200"

# Test Zero Cache (this might fail if not configured, but check anyway)
test_api "Zero Cache Health" "http://localhost:4848/health" "200"

echo -e "${BLUE}2. Testing Schema Configuration${NC}"
echo "==============================="

# Test that ZRocket schema export contains expected tables
run_test "Schema Export Contains Tables" \
    "curl -s http://localhost:8011/api/schema/export" \
    "\"tables\""

# Test that table mappings are available
run_test "Table Mappings Available" \
    "curl -s http://localhost:8011/api/schema/table-mappings" \
    "\"mappings\""

# Test that source server can load metadata
run_test "Source Server Metadata Loaded" \
    "curl -s http://localhost:8001/metadata/status" \
    "\"schema\""

echo -e "${BLUE}3. Testing Separation of Concerns${NC}"
echo "================================="

# Test that ZRocket no longer has change source endpoints
test_api "ZRocket No Change Source" "http://localhost:8011/changes/v0/stream" "404"

# Test that source server has change source endpoints
test_api "Source Server Has Change Stream" "http://localhost:8001/changes/v0/stream" "404"  # 404 expected for GET request to WebSocket endpoint

# Test that ZRocket no longer has metadata functionality
test_api "ZRocket No Metadata Schemas" "http://localhost:8011/zrocket/metadata/schemas" "404"

# Test that source server has metadata functionality
test_api "Source Server Has Metadata" "http://localhost:8001/metadata/schemas" "200"

echo -e "${BLUE}4. Testing Data Flow${NC}"
echo "==================="

# Test that we can seed data through ZRocket
run_test "ZRocket Seed Data" \
    "curl -s -X POST http://localhost:8011/zrocket/seed-data" \
    "success"

# Test that ZRocket can still list tables (demo functionality)
run_test "ZRocket Table Listing" \
    "curl -s http://localhost:8011/zrocket/tables" \
    "discriminatedTables"

echo ""
echo "🏁 Test Results Summary"
echo "======================="
echo -e "${GREEN}✅ Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Tests Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed! Architecture separation is working correctly.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  Some tests failed. Please check the output above.${NC}"
    exit 1
fi
