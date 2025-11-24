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
docker create --name ${CONTAINER_NAME} ${IMAGE_NAME}
docker cp ${CONTAINER_NAME}:/app/android/app/build/outputs/apk/${BUILD_TYPE}/app-${BUILD_TYPE}.apk \
    build/outputs/apk/app-${BUILD_TYPE}.apk
docker rm ${CONTAINER_NAME}

echo -e "${GREEN}Build complete! APK location: build/outputs/apk/app-${BUILD_TYPE}.apk${NC}"

