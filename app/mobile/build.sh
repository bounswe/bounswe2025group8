#!/bin/bash
# Build script for Android APK using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default values
BUILD_TYPE=${BUILD_TYPE:-debug}
IMAGE_NAME="mobile-build"
CONTAINER_NAME="mobile-build-container"

echo -e "${GREEN}Starting Android APK build process...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${YELLOW}Please edit .env file with your configuration before building.${NC}"
    else
        echo -e "${RED}Error: .env.example not found. Please create .env file manually.${NC}"
        exit 1
    fi
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Build Docker image
# Use linux/amd64 platform to avoid Rosetta issues on Apple Silicon
echo -e "${GREEN}Building Docker image...${NC}"
docker build \
    --platform linux/amd64 \
    --build-arg BUILD_TYPE=${BUILD_TYPE} \
    --build-arg API_HOST=${API_HOST:-localhost} \
    --build-arg API_PORT=${API_PORT:-8000} \
    -t ${IMAGE_NAME} \
    -f Dockerfile .

# Create output directory
mkdir -p build/outputs/apk

# Run container to extract APK
echo -e "${GREEN}Extracting APK from container...${NC}"
docker create --name ${CONTAINER_NAME} ${IMAGE_NAME} > /dev/null 2>&1

# Find the APK file location (it might be in different locations)
APK_PATH=""
POSSIBLE_PATHS=(
    "/app/android/app/build/outputs/apk/${BUILD_TYPE}/app-${BUILD_TYPE}.apk"
    "/app/android/app/build/outputs/apk/${BUILD_TYPE}/app-debug.apk"
    "/app/android/app/build/outputs/apk/${BUILD_TYPE}/app-release.apk"
    "/app/android/app/build/outputs/apk/debug/app-debug.apk"
    "/app/android/app/build/outputs/apk/release/app-release.apk"
)

# Try to find the APK file
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
    echo -e "${YELLOW}APK not found at expected locations. Searching container...${NC}"
    APK_PATH=$(docker exec ${CONTAINER_NAME} find /app/android -name "*.apk" -type f 2>/dev/null | head -1)
    
    if [ -z "$APK_PATH" ]; then
        echo -e "${YELLOW}Listing build output directory structure...${NC}"
        docker exec ${CONTAINER_NAME} find /app/android/app/build/outputs -type f 2>/dev/null | head -20 || true
        echo ""
        echo -e "${YELLOW}Checking if build directory exists...${NC}"
        docker exec ${CONTAINER_NAME} ls -la /app/android/app/build/ 2>/dev/null || true
    fi
fi

if [ -z "$APK_PATH" ]; then
    echo -e "${RED}Error: Could not find APK file in container${NC}"
    echo -e "${YELLOW}The build may have completed but the APK was not generated.${NC}"
    echo -e "${YELLOW}Checking Gradle build status...${NC}"
    docker exec ${CONTAINER_NAME} cat /app/android/app/build/outputs/logs/manifest-merger-*-report.txt 2>/dev/null | tail -20 || true
    docker rm ${CONTAINER_NAME}
    exit 1
fi

# Extract the APK
echo -e "${GREEN}Copying APK from container...${NC}"
docker cp ${CONTAINER_NAME}:${APK_PATH} build/outputs/apk/app-${BUILD_TYPE}.apk
docker rm ${CONTAINER_NAME}

# Verify the APK was extracted
if [ -f "build/outputs/apk/app-${BUILD_TYPE}.apk" ]; then
    APK_SIZE=$(ls -lh build/outputs/apk/app-${BUILD_TYPE}.apk | awk '{print $5}')
    echo -e "${GREEN}✓ APK successfully extracted (Size: $APK_SIZE)${NC}"
else
    echo -e "${RED}Error: APK extraction failed${NC}"
    exit 1
fi

echo -e "${GREEN}Build complete! APK location: build/outputs/apk/app-${BUILD_TYPE}.apk${NC}"

