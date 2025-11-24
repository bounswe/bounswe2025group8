# Neighborhood Assistance Mobile App - Docker Build Guide

This guide explains how to build the Android APK using Docker, without requiring Expo EAS (Application Services).

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Environment Configuration](#environment-configuration)
- [Build Options](#build-options)
- [Installation Guide](#installation-guide)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

---

## Prerequisites

### Required Software

1. **Docker Desktop** (or Docker Engine on Linux)
   - macOS: [Download Docker Desktop for Mac](https://docs.docker.com/desktop/install/mac-install/)
   - Windows: [Download Docker Desktop for Windows](https://docs.docker.com/desktop/install/windows-install/)
   - Linux: [Install Docker Engine](https://docs.docker.com/engine/install/)

2. **At least 8GB of RAM** allocated to Docker (16GB recommended)
   - Docker Desktop → Settings → Resources → Memory

3. **At least 20GB of free disk space** for the build environment

### Optional (for installing APK to device)

- **Android Debug Bridge (ADB)** - for installing APK to connected devices
  ```bash
  # macOS (with Homebrew)
  brew install android-platform-tools
  
  # Ubuntu/Debian
  sudo apt install android-tools-adb
  ```

---

## Quick Start

### Option 1: Using the Build Script (Recommended)

```bash
# Navigate to mobile directory
cd app/mobile

# Make the build script executable
chmod +x docker-build.sh

# Build release APK (default)
./docker-build.sh

# Or build debug APK
./docker-build.sh debug
```

The APK will be saved to `build/outputs/apk/app-release.apk` or `build/outputs/apk/app-debug.apk`.

### Option 2: Using Docker Compose

```bash
# Navigate to mobile directory
cd app/mobile

# Build release APK
docker-compose up mobile-build

# Or build debug APK
docker-compose up mobile-build-debug

# Or build production APK (with production API endpoint)
docker-compose up mobile-build-production
```

### Option 3: Manual Docker Commands

```bash
# Navigate to mobile directory
cd app/mobile

# Build the Docker image
docker build \
    --build-arg BUILD_TYPE=release \
    --build-arg API_HOST=10.0.2.2 \
    --build-arg API_PORT=8000 \
    -t neighborhood-assistance-mobile:release \
    .

# Create container and extract APK
docker create --name apk-builder neighborhood-assistance-mobile:release
docker cp apk-builder:/output/app.apk ./app-release.apk
docker rm apk-builder
```

---

## Environment Configuration

### Setting Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` to set your configuration:
   ```bash
   # For Android Emulator
   API_HOST=10.0.2.2
   API_PORT=8000
   BUILD_TYPE=release
   
   # For Production
   API_HOST=35.222.191.20
   API_PORT=8000
   BUILD_TYPE=release
   ```

### API Host Configuration

| Environment | API_HOST Value | Description |
|------------|----------------|-------------|
| Android Emulator | `10.0.2.2` | Special IP that routes to host machine |
| iOS Simulator | Your LAN IP (e.g., `192.168.1.100`) | Run `ipconfig getifaddr en0` to find it |
| Physical Device | Your LAN IP or production IP | Device must be on same network |
| Production | `35.222.191.20` | Production server IP |

---

## Build Options

### Development Build (Debug)

Debug builds are faster and include debugging capabilities:

```bash
./docker-build.sh debug
# Or
docker-compose up mobile-build-debug
```

**Characteristics:**
- Faster build time (~10-15 minutes)
- Larger APK size (~50-100 MB)
- Includes React Native debugging tools
- JavaScript bundled in debug mode

### Production Build (Release)

Release builds are optimized for distribution:

```bash
./docker-build.sh release
# Or
docker-compose up mobile-build
```

**Characteristics:**
- Longer build time (~15-25 minutes)
- Smaller APK size (~20-40 MB)
- Optimized and minified code
- No debugging tools included

### Custom API Configuration

Build with custom API endpoint:

```bash
./docker-build.sh release 35.222.191.20 8000
# Or
API_HOST=35.222.191.20 API_PORT=8000 docker-compose up mobile-build
```

---

## Installation Guide

### Installing on Android Emulator

1. Start Android Emulator (via Android Studio or command line)

2. Install the APK:
   ```bash
   adb -e install build/outputs/apk/app-release.apk
   ```

### Installing on Physical Android Device

1. **Enable USB Debugging** on your Android device:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times to enable Developer Options
   - Go to Settings → Developer Options → Enable USB Debugging

2. Connect device via USB and verify connection:
   ```bash
   adb devices
   ```

3. Install the APK:
   ```bash
   adb install build/outputs/apk/app-release.apk
   ```

### Installing via File Transfer

1. Copy the APK to your device (via USB, email, cloud storage, etc.)

2. On your Android device:
   - Open a file manager
   - Navigate to the APK file
   - Tap to install
   - If prompted, allow installation from unknown sources

---

## Troubleshooting

### Common Issues

#### 1. Docker Build Fails with Memory Error

**Symptom:** Build fails with "Killed" or "Out of memory" error

**Solution:** Increase Docker memory allocation:
- Docker Desktop → Settings → Resources → Memory → Set to 8GB or more

#### 2. Build Takes Too Long

**Symptom:** Build takes more than 30 minutes

**Solutions:**
- Use debug build for faster iteration: `./docker-build.sh debug`
- Ensure sufficient disk space (at least 20GB free)
- Use SSD storage for Docker

#### 3. APK Won't Install on Device

**Symptom:** "App not installed" error on device

**Solutions:**
- Uninstall any existing version of the app first
- Enable "Unknown sources" in device settings
- For development: Enable "Install via USB" in Developer Options

#### 4. App Can't Connect to Backend

**Symptom:** Network errors when app tries to reach API

**Solutions:**
- Verify API_HOST is correct for your environment
- Ensure backend is running and accessible
- For emulator: Use `10.0.2.2` (not `localhost`)
- For physical device: Use your computer's LAN IP

#### 5. Docker Image Build Fails

**Symptom:** Error during `npm ci` or gradle build

**Solutions:**
```bash
# Clean Docker cache and rebuild
docker builder prune -f
docker-compose build --no-cache mobile-build
```

### Checking Build Logs

View detailed build logs:
```bash
# During docker build
docker build --progress=plain ...

# Check container logs
docker logs <container-id>
```

---

## Architecture

### Build Process Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      Docker Build Process                        │
├─────────────────────────────────────────────────────────────────┤
│  1. Base Image: node:20-bookworm                                │
│     └── Install JDK 17, Android SDK, NDK                        │
│                                                                  │
│  2. Install Dependencies                                         │
│     └── npm ci (from package.json)                              │
│                                                                  │
│  3. Expo Prebuild                                                │
│     └── npx expo prebuild --platform android                    │
│     └── Generates native Android project in /android            │
│                                                                  │
│  4. Gradle Build                                                 │
│     └── ./gradlew assembleRelease (or assembleDebug)            │
│     └── Produces APK in /android/app/build/outputs/apk          │
│                                                                  │
│  5. Output                                                       │
│     └── APK copied to /output/app.apk                           │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
mobile/
├── Dockerfile              # Docker build configuration
├── docker-compose.yml      # Docker Compose for easy builds
├── docker-build.sh         # Build script
├── .env.example            # Example environment variables
├── app.json                # Expo app configuration
├── app.config.js           # Dynamic Expo configuration
├── package.json            # Node.js dependencies
└── build/
    └── outputs/
        └── apk/            # Built APK files appear here
            ├── app-release.apk
            └── app-debug.apk
```

### Android SDK Components Used

- **Platform Tools**: ADB and fastboot
- **Build Tools**: 34.0.0
- **Platform**: Android 34 (API Level 34)
- **NDK**: 26.1.10909125 (for native modules)

---

## Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Android Developer Documentation](https://developer.android.com/)
- [Docker Documentation](https://docs.docker.com/)

## Support

If you encounter issues not covered in this guide, please:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review Docker build logs
3. Open an issue in the repository with:
   - Your operating system
   - Docker version (`docker --version`)
   - Full error message/logs
   - Steps to reproduce

