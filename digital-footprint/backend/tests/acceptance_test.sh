#!/bin/bash

# Acceptance test script for whoMi backend API
# Tests the four main endpoints as specified in requirements

set -e

BASE_URL="http://localhost:5000"
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Running whoMi Backend Acceptance Tests"
echo "=========================================="
echo ""

# Check if server is running
echo "Checking if server is running at $BASE_URL..."
if ! curl -s "$BASE_URL/api/health" > /dev/null; then
    echo -e "${RED}❌ Server is not running. Please start the server first:${NC}"
    echo "   python app.py"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test 1: POST /api/scan
echo "Test 1: POST /api/scan with email"
SCAN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/scan" \
  -H "Content-Type: application/json" \
  -d '{"type":"email","value":"test@example.com"}')

echo "Response: $SCAN_RESPONSE"

# Check if response contains scan_id and status
if echo "$SCAN_RESPONSE" | grep -q "scan_id" && echo "$SCAN_RESPONSE" | grep -q "status"; then
    echo -e "${GREEN}✓ Test 1 PASSED: POST /api/scan returns scan_id and status${NC}"
    # Extract scan_id more reliably
    SCAN_ID=$(echo "$SCAN_RESPONSE" | sed -n 's/.*"scan_id": "\([^"]*\)".*/\1/p')
    echo "  Scan ID: $SCAN_ID"
else
    echo -e "${RED}❌ Test 1 FAILED${NC}"
    exit 1
fi
echo ""

# Test 2: GET /api/report/<scan_id>
echo "Test 2: GET /api/report/<scan_id>"
REPORT_RESPONSE=$(curl -s "$BASE_URL/api/report/$SCAN_ID")
echo "Response: $REPORT_RESPONSE"

if echo "$REPORT_RESPONSE" | grep -q "results" && echo "$REPORT_RESPONSE" | grep -q "status"; then
    echo -e "${GREEN}✓ Test 2 PASSED: GET /api/report returns status and results${NC}"
else
    echo -e "${RED}❌ Test 2 FAILED${NC}"
    exit 1
fi
echo ""

# Test 3: POST /api/breach-check
echo "Test 3: POST /api/breach-check"
BREACH_RESPONSE=$(curl -s -X POST "$BASE_URL/api/breach-check" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}')

echo "Response: $BREACH_RESPONSE"

if echo "$BREACH_RESPONSE" | grep -q "breaches"; then
    echo -e "${GREEN}✓ Test 3 PASSED: POST /api/breach-check returns breaches array${NC}"
else
    echo -e "${RED}❌ Test 3 FAILED${NC}"
    exit 1
fi
echo ""

# Test 4: POST /api/predict
echo "Test 4: POST /api/predict"
PREDICT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"text":"I love football and open source development"}')

echo "Response: $PREDICT_RESPONSE"

if echo "$PREDICT_RESPONSE" | grep -q "age_range" && echo "$PREDICT_RESPONSE" | grep -q "interests" && echo "$PREDICT_RESPONSE" | grep -q "risk_score"; then
    echo -e "${GREEN}✓ Test 4 PASSED: POST /api/predict returns prediction data${NC}"
else
    echo -e "${RED}❌ Test 4 FAILED${NC}"
    exit 1
fi
echo ""

echo "=========================================="
echo -e "${GREEN}🎉 All acceptance tests PASSED!${NC}"
