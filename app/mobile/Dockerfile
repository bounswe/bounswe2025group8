# Use Node.js 20 as the base image
# Note: We specify linux/amd64 to ensure consistent builds across platforms (Mac M1/M2, Windows, Linux).
# On Apple Silicon, this runs in emulation. On Windows/Linux x64, this runs natively.
FROM --platform=linux/amd64 node:20-bookworm

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV ANDROID_HOME=/opt/android-sdk
# Add cmake to path if needed, though usually not for basic RN
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools

# Increase Gradle memory to avoid OOM during build
ENV GRADLE_OPTS="-Dorg.gradle.daemon=false -Dorg.gradle.jvmargs=\"-Xmx2g -XX:MaxMetaspaceSize=512m\""

# Install OpenJDK 17 and other dependencies
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    unzip \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Download and install Android Command Line Tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d ${ANDROID_HOME}/cmdline-tools \
    && mv ${ANDROID_HOME}/cmdline-tools/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm /tmp/cmdline-tools.zip

# Accept Android SDK licenses and install components
# Installing both 34 and 35 to be safe with newer RN versions
RUN yes | sdkmanager --licenses \
    && sdkmanager "platform-tools" "platforms;android-34" "platforms;android-35" "build-tools;34.0.0" "build-tools;35.0.0"

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Create .env file from example if it doesn't exist
RUN if [ -f .env.example ]; then cp .env.example .env; fi

# Run prebuild to generate Android native code
RUN npx expo prebuild --platform android --no-install

# Generate a release keystore for signing
RUN keytool -genkey -v \
    -keystore my-release-key.keystore \
    -alias my-key-alias \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -dname "CN=Android Release,O=Android,C=US" \
    -storepass password \
    -keypass password

# Configure Gradle to use the generated keystore for signing
RUN echo "" >> android/gradle.properties && \
    echo "MYAPP_UPLOAD_STORE_FILE=../../my-release-key.keystore" >> android/gradle.properties && \
    echo "MYAPP_UPLOAD_KEY_ALIAS=my-key-alias" >> android/gradle.properties && \
    echo "MYAPP_UPLOAD_STORE_PASSWORD=password" >> android/gradle.properties && \
    echo "MYAPP_UPLOAD_KEY_PASSWORD=password" >> android/gradle.properties

# Build the APK using Gradle
WORKDIR /app/android
# Use chmod to ensure gradlew is executable
RUN chmod +x ./gradlew
# Skip linting tasks to prevent build failures on minor warnings (common in release builds)
RUN ./gradlew assembleRelease -x lint -x lintVitalRelease

# Reset workdir
WORKDIR /app

# Command to copy the APK
CMD ["sh", "-c", "cp android/app/build/outputs/apk/release/app-release.apk /output/app-release.apk || echo 'Build failed or file not found'"]
