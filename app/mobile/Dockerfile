# Multi-stage Dockerfile for building React Native Expo Android APK
FROM node:20-slim AS dependencies

# Install basic dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci

# Copy source code
COPY . .

# Stage 2: Android build environment
FROM node:20-slim AS android-builder

# Install required packages for Android build
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    git \
    curl \
    unzip \
    wget \
    file \
    binutils \
    && rm -rf /var/lib/apt/lists/*

# Set environment variables to help with Rosetta/emulation issues
ENV DOCKER_DEFAULT_PLATFORM=linux/amd64
ENV FORCE_UNSAFE_CONFIGURE=1

# Find the actual Java installation directory and verify it exists
RUN JAVA_HOME_PATH=$(dpkg -L openjdk-17-jdk 2>/dev/null | grep -E '^/usr/lib/jvm/[^/]+$' | head -1) && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH=$(readlink -f /usr/bin/java 2>/dev/null | sed "s:/bin/java::"); \
    fi && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH="/usr/lib/jvm/java-17-openjdk-amd64"; \
    fi && \
    echo "Detected JAVA_HOME: $JAVA_HOME_PATH" && \
    ls -la $JAVA_HOME_PATH/bin/java && \
    $JAVA_HOME_PATH/bin/java -version && \
    $JAVA_HOME_PATH/bin/javac -version

# Set JAVA_HOME environment variable (will be overridden in RUN commands if needed)
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
ENV PATH=$PATH:$JAVA_HOME/bin

# Install Android SDK
ENV ANDROID_HOME=/opt/android-sdk
ENV PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools:$ANDROID_HOME/cmdline-tools/latest/bin

# Create Android SDK directory
RUN mkdir -p $ANDROID_HOME/cmdline-tools

# Download and install Android Command Line Tools
RUN wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip commandlinetools-linux-11076708_latest.zip -d $ANDROID_HOME/cmdline-tools && \
    mv $ANDROID_HOME/cmdline-tools/cmdline-tools $ANDROID_HOME/cmdline-tools/latest && \
    rm commandlinetools-linux-11076708_latest.zip

# Accept Android licenses and install required SDK components
# Find Java path and set JAVA_HOME before running sdkmanager
RUN JAVA_HOME_PATH=$(dpkg -L openjdk-17-jdk 2>/dev/null | grep -E '^/usr/lib/jvm/[^/]+$' | head -1) && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH=$(readlink -f /usr/bin/java 2>/dev/null | sed "s:/bin/java::"); \
    fi && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH="/usr/lib/jvm/java-17-openjdk-amd64"; \
    fi && \
    export JAVA_HOME=$JAVA_HOME_PATH && \
    echo "Using JAVA_HOME: $JAVA_HOME" && \
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true

RUN JAVA_HOME_PATH=$(dpkg -L openjdk-17-jdk 2>/dev/null | grep -E '^/usr/lib/jvm/[^/]+$' | head -1) && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH=$(readlink -f /usr/bin/java 2>/dev/null | sed "s:/bin/java::"); \
    fi && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH="/usr/lib/jvm/java-17-openjdk-amd64"; \
    fi && \
    export JAVA_HOME=$JAVA_HOME_PATH && \
    echo "Using JAVA_HOME: $JAVA_HOME" && \
    $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager "platform-tools" "platforms;android-34" "build-tools;34.0.0" "cmdline-tools;latest"

# Install Expo CLI globally
RUN npm install -g expo-cli@latest @expo/cli@latest

# Set working directory
WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/package*.json ./
COPY --from=dependencies /app/tsconfig.json ./
COPY --from=dependencies /app/app.json ./
COPY --from=dependencies /app/app.config.js* ./
COPY --from=dependencies /app/app ./app
COPY --from=dependencies /app/assets ./assets
COPY --from=dependencies /app/components ./components
COPY --from=dependencies /app/constants ./constants
COPY --from=dependencies /app/hooks ./hooks
COPY --from=dependencies /app/lib ./lib
COPY --from=dependencies /app/theme ./theme
COPY --from=dependencies /app/utils ./utils
COPY --from=dependencies /app/scripts ./scripts

# Copy environment file if it exists
COPY .env* ./

# Set build arguments for environment variables
ARG API_HOST=localhost
ARG API_PORT=8000
ARG BUILD_TYPE=debug
ARG PRODUCTION_API_URL=

# Set environment variables for build
ENV API_HOST=${API_HOST}
ENV API_PORT=${API_PORT}
ENV BUILD_TYPE=${BUILD_TYPE}
ENV PRODUCTION_API_URL=${PRODUCTION_API_URL}

# Generate native Android project
RUN npx expo prebuild --platform android --clean

# Create gradle.properties to handle Rosetta/architecture issues
RUN mkdir -p /app/android && \
    echo "org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m" > /app/android/gradle.properties && \
    echo "android.useAndroidX=true" >> /app/android/gradle.properties && \
    echo "android.enableJetifier=true" >> /app/android/gradle.properties && \
    echo "org.gradle.daemon=false" >> /app/android/gradle.properties && \
    echo "org.gradle.parallel=false" >> /app/android/gradle.properties && \
    echo "org.gradle.configureondemand=false" >> /app/android/gradle.properties && \
    echo "android.defaults.buildfeatures.buildconfig=true" >> /app/android/gradle.properties && \
    echo "android.native.buildOutput=verbose" >> /app/android/gradle.properties

# Note: With --platform linux/amd64 in docker build, Rosetta issues should be minimized
# The build will proceed with all architectures supported by the Android SDK

# Build APK
WORKDIR /app/android

# Build APK based on BUILD_TYPE
# Set JAVA_HOME dynamically before running Gradle
RUN JAVA_HOME_PATH=$(dpkg -L openjdk-17-jdk 2>/dev/null | grep -E '^/usr/lib/jvm/[^/]+$' | head -1) && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH=$(readlink -f /usr/bin/java 2>/dev/null | sed "s:/bin/java::"); \
    fi && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        JAVA_HOME_PATH=$(ls -d /usr/lib/jvm/* 2>/dev/null | head -1); \
    fi && \
    if [ -z "$JAVA_HOME_PATH" ] || [ ! -d "$JAVA_HOME_PATH" ]; then \
        echo "ERROR: Could not find Java installation. Available Java installations:"; \
        ls -la /usr/lib/jvm/ 2>/dev/null || echo "No /usr/lib/jvm directory found"; \
        which java || echo "No java in PATH"; \
        exit 1; \
    fi && \
    export JAVA_HOME=$JAVA_HOME_PATH && \
    export PATH=$PATH:$JAVA_HOME/bin && \
    echo "Using JAVA_HOME: $JAVA_HOME" && \
    ls -la $JAVA_HOME/bin/java && \
    $JAVA_HOME/bin/java -version && \
    echo "Starting Gradle build..." && \
    if [ "$BUILD_TYPE" = "debug" ]; then \
        ./gradlew assembleDebug --no-daemon --stacktrace --warning-mode all || \
        (echo "Build failed, retrying with continue on error..." && \
         ./gradlew assembleDebug --no-daemon --continue --stacktrace 2>&1 | head -100); \
    else \
        ./gradlew assembleRelease --no-daemon --stacktrace --warning-mode all || \
        (echo "Build failed, retrying with continue on error..." && \
         ./gradlew assembleRelease --no-daemon --continue --stacktrace 2>&1 | head -100); \
    fi

# The APK will be available at:
# /app/android/app/build/outputs/apk/debug/app-debug.apk (for debug)
# /app/android/app/build/outputs/apk/release/app-release.apk (for release)

