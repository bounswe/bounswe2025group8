# Mobile Application

This is a React Native mobile application built with [Expo](https://expo.dev).

## Quick Start

### Development

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Building Android APK

This project uses Docker to build Android APK files without requiring Expo EAS or local Android SDK setup.

### Prerequisites

- Docker installed and running
- Environment variables configured (see `.env.example`)

### Quick Build

1. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API configuration
   ```

2. **Build the APK:**
   ```bash
   # For development (debug) build
   ./build.sh
   
   # For production (release) build
   BUILD_TYPE=release ./build.sh
   ```

3. **Find your APK:**
   - Debug: `build/outputs/apk/app-debug.apk`
   - Release: `build/outputs/apk/app-release.apk`

For detailed build instructions, troubleshooting, and advanced options, see **[BUILD.md](./BUILD.md)**.

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
