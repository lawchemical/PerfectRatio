#!/bin/bash

# Test Railway API endpoints

API_URL="https://perfectratio-production.up.railway.app"
API_KEY="pr_live_7bbfqrKTfUZVnw00_kvsS9_UPRwiyKhoJ2xh9xLYoqM"

echo "Testing Railway API..."
echo "====================="

echo -e "\n1. Testing Health Check:"
curl -s "$API_URL/health" | jq '.'

echo -e "\n2. Testing Suppliers Endpoint:"
response=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/api/suppliers")
echo "$response" | jq '.'

echo -e "\n3. Checking response structure:"
echo "Response type: $(echo "$response" | jq -r 'type')"
if echo "$response" | jq -e '.data' > /dev/null 2>&1; then
    echo "Has 'data' field: true"
    echo "Data field type: $(echo "$response" | jq -r '.data | type')"
    echo "Number of suppliers: $(echo "$response" | jq '.data | length')"
else
    echo "Has 'data' field: false"
    if [ "$(echo "$response" | jq -r 'type')" = "array" ]; then
        echo "Response is raw array with $(echo "$response" | jq 'length') items"
    fi
fi

echo -e "\n4. Testing Fragrance Oils Endpoint:"
oils_response=$(curl -s -H "x-api-key: $API_KEY" "$API_URL/api/fragrance-oils?page=1&pageSize=10")
echo "$oils_response" | jq '{
    has_data: (.data != null),
    data_count: (.data | length),
    page: .page,
    cached: .cached
}'