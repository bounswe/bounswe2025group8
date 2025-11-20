# Neighborhood Assistance Board

## Introduction

The Neighborhood Assistance Board is a community-driven web and mobile platform designed to connect individuals who need help with those willing to offer assistance. It empowers registered users to post and manage various types of assistance requests—such as grocery shopping, tutoring, or minor repairs—and enables volunteers to browse, accept, and complete tasks based on their availability and location.

The platform prioritizes accessibility, trust, and usability, with features like personalized feeds, volunteer tracking, ratings and reviews, and privacy-preserving communication. It also supports community-based moderation and task categorization to enhance safety and relevance.

### Key Features

- **Request Management**: Users can create, edit, and manage assistance requests with detailed descriptions and categorization
- **Volunteer Matching**: Volunteers can browse available requests filtered by location, category, and availability
- **Ratings & Reviews**: Built-in feedback system to build trust within the community
- **Privacy-Preserving Communication**: Secure messaging between requesters and volunteers
- **Community Moderation**: Support for moderators to ensure platform safety
- **Personalized Feeds**: Custom feeds based on user location, interests, and availability

---

## Frontend Web Application

The frontend is a modern React application built with JavaScript/TypeScript (we aim to write everything in TypeScript) and Vite, providing a fast and responsive user interface.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 24.x or higher (LTS recommended)
- **npm**: Version 10.x or higher (comes with Node.js)
- **Docker**: Version 20.x or higher (for containerized deployment)
- **Docker Compose**: Version 2.x or higher (optional, for multi-container setups)

You can verify your installations by running:

```bash
node --version
npm --version
docker --version
docker-compose --version
```

### Project Structure

```
app/frontend/
├── src/                    # Source code
├── public/                 # Static assets
├── node_modules/          # Dependencies (auto-generated)
├── package.json           # Project dependencies and scripts
├── package-lock.json      # Locked dependency versions
├── Dockerfile             # Docker configuration
├── vite.config.ts         # Vite build configuration
├── tsconfig.json          # TypeScript configuration
├── eslint.config.js       # ESLint configuration
└── index.html             # HTML entry point
```

### Installation & Setup

#### Option 1: Local Development (Without Docker)

1. **Navigate to the frontend directory**:
   ```bash
   cd app/frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The application will start on `http://localhost:5173` by default. The development server includes:
   - Hot Module Replacement (HMR) for instant updates
   - TypeScript type checking
   - ESLint code quality checks

#### Option 2: Docker Development with Full Stack (Backend + Database)

For development with the backend and database, use Docker Compose to run all services together:

1. **Navigate to the backend directory** (where docker-compose.yml is located):
   ```bash
   cd app/backend
   ```

2. **Start backend and database services**:
   ```bash
   docker compose up -d backend db
   ```

   This command:
   - `up`: Creates and starts the containers
   - `-d`: Runs in detached mode (background)
   - `backend db`: Only starts the backend and database services

3. **In another terminal, navigate to the frontend directory** and run the development server:
   ```bash
   cd app/frontend
   npm install  # if not already installed
   npm run dev
   ```

   The frontend will now connect to the backend API running in Docker at `http://localhost:8000/api`

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5173`

5. **View logs** from running services:
   ```bash
   cd app/backend
   docker compose logs -f backend db  # Follow logs from backend and database
   ```

6. **Stop the services**:
   ```bash
   cd app/backend
   docker compose down
   ```

#### Option 3: Docker Development (Frontend Only)

If you only want to run the frontend in Docker without backend dependencies:

1. **Navigate to the frontend directory**:
   ```bash
   cd app/frontend
   ```

2. **Build the Docker image**:
   ```bash
   docker build -t neighborhood-frontend .
   ```

   This command:
   - `-t neighborhood-frontend`: Tags the image with a name for easy reference
   - `.`: Uses the Dockerfile in the current directory

3. **Run the Docker container**:
   ```bash
   docker run -p 5173:5173 -v $(pwd):/app -v /app/node_modules neighborhood-frontend
   ```

   Explanation of the command:
   - `-p 5173:5173`: Maps port 5173 from the container to your host machine
   - `-v $(pwd):/app`: Mounts your current directory to `/app` in the container for live code updates
   - `-v /app/node_modules`: Creates an anonymous volume for node_modules to prevent conflicts with host system
   - `neighborhood-frontend`: The name of the image to run

   **Windows PowerShell users** should replace `$(pwd)` with `${PWD}`:
   ```powershell
   docker run -p 5173:5173 -v ${PWD}:/app -v /app/node_modules neighborhood-frontend
   ```

   **Windows Command Prompt users** should replace `$(pwd)` with `%cd%`:
   ```cmd
   docker run -p 5173:5173 -v %cd%:/app -v /app/node_modules neighborhood-frontend
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:5173`

5. **Stop the container**:
   Press `Ctrl+C` in the terminal, or in another terminal:
   ```bash
   docker ps                    # Find the container ID
   docker stop <container_id>   # Stop the container
   ```

### Troubleshooting

#### Common Issues

**Issue**: `npm install` fails with permission errors
- **Solution**: Try running with `npm install --unsafe-perm` or use `sudo` (Linux/Mac)

**Issue**: Port 5173 is already in use
- **Solution**: Either stop the process using port 5173, or change the port in `vite.config.ts`:
  ```typescript
  export default defineConfig({
    server: {
      port: 3000  // or any other available port
    }
  })
  ```

**Issue**: Docker container cannot access files (permission denied)
- **Solution**: On Linux, you may need to adjust file permissions:
  ```bash
  sudo chown -R $USER:$USER app/frontend
  ```

**Issue**: Changes not reflecting in Docker development mode
- **Solution**: Ensure the volume mount is correct and restart the container

**Issue**: `node_modules` conflicts between host and container
- **Solution**: The anonymous volume `-v /app/node_modules` should prevent this, but if issues persist, remove your local `node_modules` before running Docker

---

## Mobile Application

The mobile application is built with **React Native** and **Expo**, providing native iOS and Android experiences with a shared JavaScript/TypeScript codebase. It offers all the core features of the platform optimized for mobile devices.

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Version 10.x or higher (comes with Node.js)
- **Expo CLI**: Installed globally via npm
- **Expo Go App**: For testing on physical devices
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS Simulator** (Mac only) or **Android Studio** (for Android Emulator)

You can verify your installations by running:

```bash
node --version
npm --version
npx expo --version
```

### Technology Stack

- **React Native 0.81.4**: Cross-platform mobile framework
- **Expo SDK 54**: Development platform and tooling
- **Expo Router 6.x**: File-based routing system
- **TypeScript 5.9**: Type-safe development
- **React Navigation 7.x**: Navigation library
- **Axios**: HTTP client for API communication
- **AsyncStorage**: Local data persistence
- **Expo Image Picker**: Image selection functionality
- **React Native Reanimated**: Smooth animations

### Project Structure

```
app/mobile/
├── app/                       # App screens (file-based routing)
│   ├── _layout.tsx           # Root layout
│   ├── index.tsx             # Landing/home screen
│   ├── feed.tsx              # Main feed screen
│   ├── signin.tsx            # Sign in screen
│   ├── signup.tsx            # Sign up screen
│   ├── profile.tsx           # User profile screen
│   ├── create_request.tsx    # Create assistance request
│   ├── v-request-details.tsx # Request details (volunteer view)
│   ├── r-request-details.tsx # Request details (requester view)
│   ├── notifications.tsx     # Notifications screen
│   ├── settings.tsx          # Settings screen
│   └── category/             # Category-based screens
├── components/               # Reusable UI components
│   └── ui/                   # Styled components
│       ├── RequestCard.tsx   # Request display card
│       ├── ProfileTop.tsx    # Profile header
│       ├── ReviewCard.tsx    # Review component
│       └── SearchBarWithResults.tsx
├── lib/                      # Core application logic
│   ├── api.ts               # API client and endpoints
│   └── auth.tsx             # Authentication context
├── constants/                # App constants
│   ├── Colors.ts            # Color definitions
│   └── theme.ts             # Theme configuration
├── hooks/                    # Custom React hooks
├── assets/                   # Static assets (images, fonts)
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

### Installation & Setup

#### Option 1: Local Development (Expo Go - Recommended for Quick Start)

This is the fastest way to get started and test on your physical device:

1. **Navigate to the mobile directory**:
   ```bash
   cd app/mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API Connection**:
   
   The mobile app needs to connect to your backend API. Update `app.json` to point to your backend:

   ```json
   {
     "expo": {
       "extra": {
         "apiHost": "YOUR_BACKEND_IP",
         "apiPort": "8000"
       }
     }
   }
   ```

   **Important**: Replace `YOUR_BACKEND_IP` with:
   - Your computer's local IP address (e.g., `192.111.1.100`) for same-network testing
   - `localhost` won't work on physical devices - use your actual local network IP
   - Your deployed backend URL (e.g., `35.222.191.20`) for testing with production

   **To find your local IP**:
   - **macOS/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: `ipconfig` and look for "IPv4 Address"

4. **Start the Expo development server**:
   ```bash
   npx expo start
   ```
   
   Or for a clean start (clears cache):
   ```bash
   npx expo start -c
   ```

5. **Run on your device or emulator**:

   After starting the development server, you'll see a QR code in your terminal. Choose your preferred method:

   **Physical Device (Recommended)**:
   - **iOS**: Open the Camera app and scan the QR code. Tap the notification to open in Expo Go
   - **Android**: Open Expo Go app and tap "Scan QR code"
   - **Important**: Ensure your phone and computer are on the **same WiFi network**

   **iOS Simulator** (Mac only):
   - Press `i` in the terminal, or
   - ```bash
     npx expo start --ios
     ```

   **Android Emulator**:
   - Start Android Studio and launch an emulator first, then
   - Press `a` in the terminal, or
   - ```bash
     npx expo start --android
     ```

   **Web Browser** (for testing):
   - Press `w` in the terminal, or
   - ```bash
     npx expo start --web
     ```

#### Option 2: Development with Full Backend Stack

For full-stack development with the backend and database running:

1. **Start the backend services** (in backend directory):
   ```bash
   cd app/backend
   docker compose up -d backend db
   ```

2. **Get your local IP address** and update `app/mobile/app.json` as described above

3. **Start the mobile development server**:
   ```bash
   cd app/mobile
   npm install  # if not already installed
   npx expo start -c
   ```

4. **Test on your device**: Scan the QR code with Expo Go app on your phone

5. **View backend logs** (if needed):
   ```bash
   cd app/backend
   docker compose logs -f backend
   ```

### Development Features

The mobile app includes several development-friendly features:

- **Hot Reload**: Code changes appear instantly without rebuilding
- **Fast Refresh**: Preserves component state during updates
- **TypeScript**: Full type safety with IntelliSense
- **Console Logs**: View in Expo Go app or terminal
- **Network Inspector**: Built-in debugging tools
- **Guest Mode**: Test features without authentication

### Guest Mode

The app supports guest mode for browsing without authentication:

- ✅ View task feed
- ✅ Browse categories
- ✅ Search requests
- ✅ View public profiles
- ❌ Create requests (requires sign in)
- ❌ Volunteer for tasks (requires sign in)
- ❌ Access notifications (requires sign in)

### Key Mobile Features

- **Request Management**: Create, edit, and manage assistance requests with photos
- **Volunteer Matching**: Browse and apply for requests with real-time updates
- **Category Filtering**: Filter requests by type (grocery shopping, tutoring, etc.)
- **Location-Based Search**: Find requests near you
- **Push Notifications**: Get notified about request updates (coming soon)
- **Profile Management**: View and edit user profiles with ratings
- **Reviews & Ratings**: Rate and review completed interactions
- **Secure Authentication**: Token-based authentication with automatic logout
- **Offline Support**: Cached data for limited offline functionality

### Available Scripts

```bash
# Start development server
npm start

# Start with cache cleared
npx expo start -c

# Open on iOS simulator (Mac only)
npm run ios

# Open on Android emulator
npm run android

# Open in web browser
npm run web

# Run linter
npm run lint
```

### Troubleshooting

#### Common Issues

**Issue**: "Network Error" or "Unable to connect to backend"
- **Solution**: 
  1. Ensure your backend is running (`docker compose up` in `app/backend`)
  2. Verify `apiHost` in `app.json` is your correct local IP
  3. Ensure phone and computer are on the **same WiFi network**
  4. Check firewall settings aren't blocking port 8000

**Issue**: "Invalid token" or "401 Unauthorized" errors
- **Solution**: 
  1. Log out and log in again to get a fresh token
  2. If switching between local and deployed backend, clear app data:
     - Close Expo Go completely
     - Reopen and rescan QR code

**Issue**: Expo Go app shows "Something went wrong"
- **Solution**: 
  1. Stop the development server (`Ctrl+C`)
  2. Clear cache: `npx expo start -c`
  3. Close and reopen Expo Go app
  4. Rescan the QR code

**Issue**: Changes not reflecting in the app
- **Solution**: 
  1. Press `r` in the terminal to reload
  2. Or shake your device and tap "Reload"
  3. If still not working: `npx expo start -c`

**Issue**: "Unable to resolve module" errors
- **Solution**: 
  ```bash
  rm -rf node_modules
  npm install
  npx expo start -c
  ```

**Issue**: iOS Simulator not found
- **Solution**: Install Xcode from Mac App Store and run:
  ```bash
  xcode-select --install
  ```

**Issue**: Android emulator not starting
- **Solution**: 
  1. Install Android Studio
  2. Open Android Studio → Tools → AVD Manager
  3. Create a new Virtual Device
  4. Start the emulator before running `npx expo start --android`

#### Platform-Specific Notes

**iOS**:
- Requires macOS for iOS Simulator
- First build may take several minutes
- Physical device testing requires Apple Developer account for production builds

**Android**:
- Emulator requires virtualization enabled in BIOS
- Expo Go works without any setup for development
- Physical device testing works immediately via Expo Go

### Backend Connection Configuration

The mobile app automatically determines the backend URL based on the environment:

- **Development (Expo Go)**: Uses `apiHost` and `apiPort` from `app.json`
- **Production**: Would use a fixed production URL (to be configured)

**Current configuration in `app.json`**:
```json
{
  "expo": {
    "extra": {
      "apiHost": "11.111.111.11",  // Update this to your IP
      "apiPort": "8000"
    }
  }
}
```

**Remember**: After changing `app.json`, restart the Expo dev server with cache cleared:
```bash
npx expo start -c
```

### Authentication & Storage

The app uses:
- **AsyncStorage** for local data persistence (tokens, user profiles, volunteer state)
- **Token-based authentication** with Django backend
- **Automatic logout** on invalid/expired tokens
- **Secure token storage** with automatic cleanup
