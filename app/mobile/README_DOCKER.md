# Docker Build Instructions for Mobile App

This directory contains a `Dockerfile` to build the Android APK for the mobile application.

## Prerequisites

- Docker installed on your machine.
- `.env.example` file (will be copied to `.env` during build if `.env` is not provided).

## Building the Docker Image

Run the following command in this directory (`bounswe2025group8/app/mobile`):

```bash
docker build -t mobile-app-builder .
```

*Note: The Dockerfile forces `linux/amd64` architecture to ensure compatibility with Android SDK tools. This works natively on Windows/Linux x86 systems. On Apple Silicon Macs, it will use emulation (which may be slower).*

## Generating the APK

The Dockerfile is configured to generate a **signed release APK** (`app-release.apk`). It automatically generates a keystore during the build process to sign the APK, ensuring it can be installed on Android devices.

To generate the APK and extract it to your local machine, run the container with a volume mount:

### Windows (PowerShell)
```powershell
# Create an output directory
mkdir output

# Run the container
docker run --rm -v "${PWD}/output:/output" mobile-app-builder
```

### macOS / Linux / Windows (Git Bash)
```bash
# Create an output directory
mkdir -p output

# Run the container
docker run --rm -v "$(pwd)/output:/output" mobile-app-builder
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

```bash
docker run --rm -v "$(pwd)/output:/output" -v "$(pwd)/.env:/app/.env" mobile-app-builder
```
