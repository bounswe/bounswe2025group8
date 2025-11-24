# Android APK Build Instructions

This document provides instructions for building the Android APK using Docker, both for development and production environments.

## Prerequisites

- Docker installed and running on your system
- Basic knowledge of Docker commands
- Access to the project repository

## Environment Variables

Before building, you need to configure environment variables. Copy the example file and edit it:

```bash
cp .env.example .env
```

Edit `.env` file with your configuration:

```env
# Backend API Configuration
API_HOST=localhost          # For development, use localhost or your LAN IP
API_PORT=8000               # Backend API port

# For production builds, uncomment and set:
# PRODUCTION_API_URL=http://your-production-domain.com:8000

# Build Configuration
BUILD_TYPE=debug           # Use 'debug' for development, 'release' for production
```

### Environment Variables Explained

- **API_HOST**: The host address of your backend API (e.g., `localhost`, `192.168.1.100`, or production domain)
- **API_PORT**: The port number where your backend API is running (default: `8000`)
- **PRODUCTION_API_URL**: Full URL for production API (e.g., `http://35.222.191.20:8000`). If set, this will override API_HOST and API_PORT.
- **BUILD_TYPE**: Build type - `debug` for development builds, `release` for production builds

## Building the APK

### Method 1: Using the Build Script (Recommended)

The easiest way to build the APK is using the provided build script:

```bash
# For debug build (development)
./build.sh

# For release build (production)
BUILD_TYPE=release ./build.sh
```

The script will:
1. Check for `.env` file and create it from `.env.example` if needed
2. Build the Docker image
3. Extract the APK to `build/outputs/apk/` directory

### Method 2: Using Docker Directly

#### Development Build (Debug APK)

```bash
# Build the Docker image
docker build \
  --build-arg BUILD_TYPE=debug \
  --build-arg API_HOST=localhost \
  --build-arg API_PORT=8000 \
  -t mobile-build \
  -f Dockerfile .

# Create output directory
mkdir -p build/outputs/apk

# Extract the APK from the container
docker create --name mobile-build-container mobile-build
docker cp mobile-build-container:/app/android/app/build/outputs/apk/debug/app-debug.apk \
  build/outputs/apk/app-debug.apk
docker rm mobile-build-container
```

#### Production Build (Release APK)

```bash
# Build the Docker image with production settings
docker build \
  --build-arg BUILD_TYPE=release \
  --build-arg API_HOST=your-production-host \
  --build-arg API_PORT=8000 \
  --build-arg PRODUCTION_API_URL=http://your-production-domain.com:8000 \
  -t mobile-build \
  -f Dockerfile .

# Create output directory
mkdir -p build/outputs/apk

# Extract the APK from the container
docker create --name mobile-build-container mobile-build
docker cp mobile-build-container:/app/android/app/build/outputs/apk/release/app-release.apk \
  build/outputs/apk/app-release.apk
docker rm mobile-build-container
```

## Build Output

After a successful build, the APK will be located at:

- **Debug build**: `build/outputs/apk/app-debug.apk`
- **Release build**: `build/outputs/apk/app-release.apk`

## Troubleshooting

### Build Fails with License Errors

If you encounter Android SDK license errors, the Dockerfile includes automatic license acceptance. If issues persist, you may need to manually accept licenses:

```bash
docker run -it mobile-build sdkmanager --licenses
```

### Build Fails with "Command not found: expo"

Make sure the Dockerfile includes the Expo CLI installation. The Dockerfile should include:
```dockerfile
RUN npm install -g expo-cli@latest @expo/cli@latest
```

### APK Not Found After Build

Check the container logs:
```bash
docker logs mobile-build-container
```

Verify the APK location in the container:
```bash
docker run --rm mobile-build ls -la /app/android/app/build/outputs/apk/debug/
```

### Environment Variables Not Working

1. Ensure `.env` file exists and contains the required variables
2. Check that `app.config.js` is being used (it takes precedence over `app.json`)
3. Verify environment variables are being passed to the Docker build with `--build-arg`

### Build Takes Too Long

The first build will take longer as it downloads Android SDK components. Subsequent builds will be faster due to Docker layer caching.

## Development vs Production Builds

### Development Build (Debug)

- **Use case**: Testing and development
- **Signing**: Automatically signed with debug keystore
- **Optimization**: Not optimized, larger file size
- **API Configuration**: Uses `API_HOST` and `API_PORT` from `.env`

### Production Build (Release)

- **Use case**: Distribution to end users
- **Signing**: Requires signing with a release keystore (configure in `android/app/build.gradle`)
- **Optimization**: Optimized and minified, smaller file size
- **API Configuration**: Uses `PRODUCTION_API_URL` if set, otherwise uses `API_HOST` and `API_PORT`

**Note**: For production releases, you'll need to configure signing keys. This is typically done in `android/app/build.gradle` after running `expo prebuild`.

## Testing the APK

### Install on Android Device/Emulator

```bash
# Using ADB (Android Debug Bridge)
adb install build/outputs/apk/app-debug.apk

# Or transfer the APK to your device and install manually
```

### Verify API Configuration

After installing the APK, check the app logs to verify the API configuration:

```bash
# View logs from connected device
adb logcat | grep "API Configuration"
```

You should see output like:
```
=== API Configuration ===
Platform: android
API_HOST: your-configured-host
Port: 8000
API_BASE_URL: http://your-configured-host:8000/api
========================
```

## Additional Notes

- The Docker build process uses multi-stage builds to optimize image size
- Android SDK and build tools are installed during the Docker build
- The `android/` directory is generated by `expo prebuild` and should not be committed to version control
- For production builds, ensure your backend API is accessible from the configured URL

## Support

If you encounter issues not covered in this guide, please check:
1. Docker logs: `docker logs <container-name>`
2. Expo documentation: https://docs.expo.dev/
3. React Native documentation: https://reactnative.dev/

