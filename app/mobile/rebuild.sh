#!/bin/bash

# Network Error Fix - Rebuild Script
# This script rebuilds your APK with the network configuration fixes

set -e  # Exit on any error

echo "🔧 Network Error Fix - Rebuild Script"
echo "====================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📂 Current directory: $SCRIPT_DIR"
echo ""

# Check if app.config.js exists
if [ ! -f "app.config.js" ]; then
    echo "❌ ERROR: app.config.js not found!"
    echo "   This file is required for the network fix."
    exit 1
fi

echo "✅ app.config.js found (will create network_security_config.xml during build)"
echo ""
echo "🧹 Cleaning cache..."
rm -rf .expo
echo "✅ Cache cleaned"

echo ""
echo "🔨 Starting EAS build with --clear-cache..."
echo "   This will take 10-20 minutes..."
echo ""
echo "   Profile: preview"
echo "   Platform: android"
echo ""

# Run the build
eas build --platform android --profile preview --clear-cache

echo ""
echo "✅ Build command completed!"
echo ""

