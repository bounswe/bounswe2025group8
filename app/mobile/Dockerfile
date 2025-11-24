# =============================================================================
# Dockerfile for Building React Native Expo Android APK
# =============================================================================
# This Dockerfile creates a consistent build environment for generating
# Android APK files without requiring Expo EAS (Application Services).
#
# Build modes:
#   - Development (debug): Faster builds, includes dev tools
#   - Production (release): Optimized, smaller APK
# =============================================================================

FROM node:20-bookworm

# Build arguments
ARG BUILD_TYPE=release
ARG API_HOST=35.222.191.20
ARG API_PORT=8000

# Environment variables
ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV BUILD_TYPE=${BUILD_TYPE}
ENV API_HOST=${API_HOST}
ENV API_PORT=${API_PORT}

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Use bash for better script support
SHELL ["/bin/bash", "-c"]

# Install system dependencies including Java
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    wget \
    unzip \
    git \
    && rm -rf /var/lib/apt/lists/*

# Dynamically detect JAVA_HOME and set it permanently
# This works for both amd64 and arm64 architectures
RUN JAVA_DIR=$(dirname $(dirname $(readlink -f $(which java)))) && \
    echo "export JAVA_HOME=${JAVA_DIR}" >> /etc/profile.d/java.sh && \
    echo "export PATH=\${JAVA_HOME}/bin:\${PATH}" >> /etc/profile.d/java.sh && \
    echo "JAVA_HOME=${JAVA_DIR}" >> /etc/environment && \
    echo "Detected JAVA_HOME: ${JAVA_DIR}"

# Set PATH to include Android SDK tools
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/34.0.0:${PATH}"

# Create directory for Android SDK
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools

# Download and install Android command-line tools
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

# Install Android SDK components with dynamically detected JAVA_HOME
RUN source /etc/profile.d/java.sh && \
    echo "Using JAVA_HOME: $JAVA_HOME" && \
    yes | sdkmanager --licenses > /dev/null 2>&1 || true && \
    sdkmanager --update && \
    sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0" \
    "ndk;26.1.10909125"

# Set NDK environment variable
ENV ANDROID_NDK_HOME=${ANDROID_HOME}/ndk/26.1.10909125

# Create app directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Create .env file from build arguments
RUN echo "API_HOST=${API_HOST}" > .env \
    && echo "API_PORT=${API_PORT}" >> .env

# Run expo prebuild to generate native Android project
RUN source /etc/profile.d/java.sh && npx expo prebuild --platform android --clean

# Set permissions for gradlew
RUN chmod +x android/gradlew

# Build the APK
# Debug build is faster and includes debugging capabilities
# Release build is optimized and smaller
RUN source /etc/profile.d/java.sh && cd android && \
    if [ "$BUILD_TYPE" = "debug" ]; then \
        ./gradlew assembleDebug --no-daemon; \
    else \
        ./gradlew assembleRelease --no-daemon; \
    fi

# Create output directory and copy APK
RUN mkdir -p /output && \
    if [ "$BUILD_TYPE" = "debug" ]; then \
        cp android/app/build/outputs/apk/debug/app-debug.apk /output/app.apk; \
    else \
        cp android/app/build/outputs/apk/release/app-release.apk /output/app.apk; \
    fi

# Default command - just keep container running or print success
CMD ["echo", "APK build complete! Use 'docker cp' to extract /output/app.apk"]
