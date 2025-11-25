# Docker Build Instructions for Mobile App

This directory contains a `Dockerfile` with two modes:
1. **Development mode**: Run Expo dev server
2. **Build mode**: Generate Android APK

## Prerequisites

- Docker installed on your machine.
- `.env.example` file (will be copied to `.env` during build if `.env` is not provided).

*Note: The Dockerfile forces `linux/amd64` architecture to ensure compatibility with Android SDK tools. This works natively on Windows/Linux x86 systems. On Apple Silicon Macs, it will use emulation (which may be slower).*

## Option 1: Run Expo Dev Server

This mode runs the Expo development server without building the APK. Perfect for development and testing.

### Build the image in dev mode:
```bash
docker build --build-arg BUILD_MODE=dev -t mobile-app-dev .
```

### Run the Expo dev server:
```bash
docker run --rm --name mobile-dev -p 8081:8081 mobile-app-dev
```

The Expo dev server will be accessible at `http://localhost:8081`. You can scan the QR code with the Expo Go app on your mobile device.

## Option 2: Build APK

This mode builds a **signed release APK** (`app-release.apk`). It automatically generates a keystore during the build process to sign the APK, ensuring it can be installed on Android devices.

### Build the image in build mode:
```bash
docker build --build-arg BUILD_MODE=build -t mobile-app-builder .
```

### Generate the APK:
```bash
# Create an output directory
mkdir -p output

# Run the container (macOS/Linux/Git Bash)
docker run --rm -v "$(pwd)/output:/output" mobile-app-builder

# Or on Windows PowerShell
docker run --rm -v "${PWD}/output:/output" mobile-app-builder
```

After the command finishes, you will find `app-release.apk` in the `output` directory.

## Troubleshooting

### Memory Issues (OOM)
If the build fails with "Resource Exhausted" or "java.lang.OutOfMemoryError":
1. Open Docker Desktop Settings.
2. Go to **Resources**.
3. Increase **Memory** to at least **4GB** (6GB recommended).
4. Apply & Restart.

## Customization

### Environment Variables
The build uses `.env.example` by default. To use custom environment variables, you can mount your own `.env` file:

**For dev mode:**
```bash
docker run --rm -p 8081:8081 -v "$(pwd)/.env:/app/.env" mobile-app-dev
```

**For build mode:**
```bash
docker run --rm -v "$(pwd)/output:/output" -v "$(pwd)/.env:/app/.env" mobile-app-builder
```
