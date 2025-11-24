#!/bin/bash
# Quick script to extract APK from existing Docker image without rebuilding

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BUILD_TYPE=${BUILD_TYPE:-debug}
IMAGE_NAME="mobile-build"
CONTAINER_NAME="mobile-build-extract"

echo -e "${GREEN}Attempting to extract APK from existing image...${NC}"

# Check if image exists
if ! docker images | grep -q "$IMAGE_NAME"; then
    echo -e "${RED}Image $IMAGE_NAME not found. Please run ./build.sh first.${NC}"
    exit 1
fi

# Create output directory
mkdir -p build/outputs/apk

# Create container from existing image
echo -e "${YELLOW}Creating container from existing image...${NC}"
docker create --name ${CONTAINER_NAME} ${IMAGE_NAME} > /dev/null 2>&1

# Find the APK file
APK_PATH=""
POSSIBLE_PATHS=(
    "/app/android/app/build/outputs/apk/${BUILD_TYPE}/app-${BUILD_TYPE}.apk"
    "/app/android/app/build/outputs/apk/${BUILD_TYPE}/app-debug.apk"
    "/app/android/app/build/outputs/apk/${BUILD_TYPE}/app-release.apk"
    "/app/android/app/build/outputs/apk/debug/app-debug.apk"
    "/app/android/app/build/outputs/apk/release/app-release.apk"
)

echo -e "${YELLOW}Searching for APK file...${NC}"
for path in "${POSSIBLE_PATHS[@]}"; do
    if docker exec ${CONTAINER_NAME} test -f "$path" 2>/dev/null; then
        APK_PATH="$path"
        echo -e "${GREEN}Found APK at: $APK_PATH${NC}"
        break
    fi
done

# If not found, search for any APK files
if [ -z "$APK_PATH" ]; then
    echo -e "${YELLOW}Searching container for APK files...${NC}"
    APK_PATH=$(docker exec ${CONTAINER_NAME} find /app/android -name "*.apk" -type f 2>/dev/null | head -1)
    
    if [ -z "$APK_PATH" ]; then
        echo -e "${RED}APK not found in container.${NC}"
        echo -e "${YELLOW}Listing build outputs...${NC}"
        docker exec ${CONTAINER_NAME} find /app/android/app/build/outputs -type f 2>/dev/null | head -20 || true
        docker rm ${CONTAINER_NAME}
        exit 1
    fi
fi

# Extract the APK
echo -e "${GREEN}Extracting APK...${NC}"
docker cp ${CONTAINER_NAME}:${APK_PATH} build/outputs/apk/app-${BUILD_TYPE}.apk
docker rm ${CONTAINER_NAME}

# Verify
if [ -f "build/outputs/apk/app-${BUILD_TYPE}.apk" ]; then
    APK_SIZE=$(ls -lh build/outputs/apk/app-${BUILD_TYPE}.apk | awk '{print $5}')
    echo -e "${GREEN}✓ APK successfully extracted (Size: $APK_SIZE)${NC}"
    echo -e "${GREEN}Location: build/outputs/apk/app-${BUILD_TYPE}.apk${NC}"
else
    echo -e "${RED}Error: APK extraction failed${NC}"
    exit 1
fi

