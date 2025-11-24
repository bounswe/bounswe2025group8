#!/bin/bash
# =============================================================================
# Docker Build Script for Android APK
# =============================================================================
# This script builds the React Native Expo app into an Android APK using Docker.
# 
# Usage:
#   ./docker-build.sh                    # Build release APK with default settings
#   ./docker-build.sh debug              # Build debug APK
#   ./docker-build.sh release            # Build release APK (explicit)
#   ./docker-build.sh release 35.222.191.20 8000  # Custom API host and port
#
# The resulting APK will be copied to ./build/outputs/apk/
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Load environment variables from .env file if it exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}Loading configuration from .env file...${NC}"
    export $(grep -v '^#' .env | xargs)
fi

# Parse arguments (command line args override .env file)
BUILD_TYPE="${1:-${BUILD_TYPE:-release}}"
API_HOST="${2:-${API_HOST:-35.222.191.20}}"
API_PORT="${3:-${API_PORT:-8000}}"

# Validate build type
if [[ "$BUILD_TYPE" != "debug" && "$BUILD_TYPE" != "release" ]]; then
    echo -e "${RED}Error: Invalid build type '$BUILD_TYPE'. Use 'debug' or 'release'.${NC}"
    exit 1
fi

# Image name
IMAGE_NAME="neighborhood-assistance-mobile"
CONTAINER_NAME="neighborhood-apk-builder"

echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}   Neighborhood Assistance Mobile APK Builder${NC}"
echo -e "${BLUE}=============================================${NC}"
echo ""
echo -e "${YELLOW}Build Configuration:${NC}"
echo -e "  Build Type: ${GREEN}$BUILD_TYPE${NC}"
echo -e "  API Host:   ${GREEN}$API_HOST${NC}"
echo -e "  API Port:   ${GREEN}$API_PORT${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Create output directory
OUTPUT_DIR="$SCRIPT_DIR/build/outputs/apk"
mkdir -p "$OUTPUT_DIR"

# Remove old container if exists
echo -e "${YELLOW}Cleaning up old containers...${NC}"
docker rm -f "$CONTAINER_NAME" 2>/dev/null || true

# Build the Docker image
echo -e "${YELLOW}Building Docker image (this may take 10-30 minutes on first run)...${NC}"
echo ""

docker build \
    --build-arg BUILD_TYPE="$BUILD_TYPE" \
    --build-arg API_HOST="$API_HOST" \
    --build-arg API_PORT="$API_PORT" \
    -t "$IMAGE_NAME:$BUILD_TYPE" \
    -f Dockerfile \
    .

# Create container to extract APK
echo -e "${YELLOW}Extracting APK from build container...${NC}"
docker create --name "$CONTAINER_NAME" "$IMAGE_NAME:$BUILD_TYPE"

# Copy APK from container
APK_FILENAME="app-$BUILD_TYPE.apk"
docker cp "$CONTAINER_NAME:/output/app.apk" "$OUTPUT_DIR/$APK_FILENAME"

# Cleanup container
docker rm "$CONTAINER_NAME"

# Get APK info
APK_PATH="$OUTPUT_DIR/$APK_FILENAME"
APK_SIZE=$(du -h "$APK_PATH" | cut -f1)

echo ""
echo -e "${GREEN}=============================================${NC}"
echo -e "${GREEN}   Build Complete!${NC}"
echo -e "${GREEN}=============================================${NC}"
echo ""
echo -e "APK Location: ${BLUE}$APK_PATH${NC}"
echo -e "APK Size:     ${BLUE}$APK_SIZE${NC}"
echo ""
echo -e "${YELLOW}To install on a connected Android device:${NC}"
echo -e "  adb install $APK_PATH"
echo ""
echo -e "${YELLOW}To install on an Android emulator:${NC}"
echo -e "  adb -e install $APK_PATH"
echo ""

