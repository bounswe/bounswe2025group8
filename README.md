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
### Database Management Commands

When working with the backend and PostgreSQL database via Docker Compose, you may need to:

- Create an admin user
- Reset/delete all containers, volumes, and images

---

#### Create an Admin User

Run this **after backend & database containers are up**:
```bash
sudo docker compose exec backend python manage.py create_admin_user
```

#### Delete the Entire Database & Images (FULL RESET)

This removes **everything**, including database volumes:
```bash
sudo docker compose down -v --rmi all
```
Use carefully — this completely wipes your database and all Docker Compose–built images.



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

- **Docker**: Version 20.x or higher (for containerized deployment).
- **Node.js** & **npm**: Optional, for local non-Docker development.

*Note: The provided Docker setup forces `linux/amd64` architecture to ensure compatibility with Android SDK tools. This works natively on Windows/Linux x86 systems. On Apple Silicon Macs, it will use emulation.*

### Technology Stack

- **React Native 0.81.4**: Cross-platform mobile framework
- **Expo SDK 54**: Development platform and tooling
- **Expo Router 6.x**: File-based routing system
- **TypeScript 5.9**: Type-safe development

### Project Structure

```
app/mobile/
├── app/                       # App screens (file-based routing)
│   ├── category/             # Category-based screens
│   ├── _layout.tsx           # Root layout
│   ├── create_request.tsx    # Create assistance request flow
│   ├── feed.tsx              # Main feed screen
│   ├── index.tsx             # Landing/home screen
│   ├── notifications.tsx     # Notifications screen
│   ├── profile.tsx           # User profile screen
│   ├── requests.tsx          # My Requests screen
│   ├── search.tsx            # Search screen
│   ├── signin.tsx            # Sign in screen
│   ├── signup.tsx            # Sign up screen
│   └── ...                   # Other screens (details, settings, etc.)
├── components/               # Reusable UI components
│   ├── forms/                # Form components (Address, Category, etc.)
│   ├── ui/                   # UI components (Cards, Headers, etc.)
│   └── ...                   # Shared components
├── lib/                      # Core application logic
│   ├── api.ts               # API client and endpoints
│   └── auth.tsx             # Authentication context
├── constants/                # App constants (Colors, Theme)
├── hooks/                    # Custom React hooks
├── theme/                    # Theme provider
├── utils/                    # Utility functions
├── assets/                   # Static assets (images, fonts)
├── Dockerfile                # Docker configuration
├── README_DOCKER.md          # Docker specific instructions
├── app.json                  # Expo configuration
├── package.json              # Dependencies and scripts
└── tsconfig.json             # TypeScript configuration
```

### Installation & Deployment (Docker)

The mobile application includes a `Dockerfile` that supports two modes: running the Expo development server and building a release APK for Android.

#### Option 1: Run Expo Dev Server (Development Mode)

This mode runs the Expo development server without building the APK. Perfect for development and testing.

1. **Navigate to the mobile directory**:
   ```bash
   cd app/mobile
   ```

2. **Build the image in dev mode**:
   ```bash
   docker build --build-arg BUILD_MODE=dev -t mobile-app-dev .
   ```

3. **Run the Expo dev server**:
   ```bash
   docker run --rm --name mobile-dev -p 8081:8081 mobile-app-dev
   ```

   The Expo dev server will be accessible at `http://localhost:8081`. You can scan the QR code with the Expo Go app on your mobile device.

   *Note: To use custom environment variables, mount your `.env` file:*
   ```bash
   docker run --rm -p 8081:8081 -v "$(pwd)/.env:/app/.env" mobile-app-dev
   ```

#### Option 2: Build Android APK (Release Mode)

This mode builds a **signed release APK** (`app-release.apk`). It automatically generates a keystore during the build process to sign the APK.

1. **Navigate to the mobile directory**:
   ```bash
   cd app/mobile
   ```

2. **Build the image in build mode**:
   ```bash
   docker build --build-arg BUILD_MODE=build -t mobile-app-builder .
   ```

3. **Generate the APK**:
   
   Create an output directory and run the container:
   
   **macOS/Linux/Git Bash:**
   ```bash
   mkdir -p output
   docker run --rm -v "$(pwd)/output:/output" mobile-app-builder
   ```

   **Windows PowerShell:**
   ```powershell
   mkdir -p output
   docker run --rm -v "${PWD}/output:/output" mobile-app-builder
   ```

   After the command finishes, you will find `app-release.apk` in the `output` directory.


### Troubleshooting

#### Memory Issues (OOM)
If the build fails with "Cannot allocate memory" or "java.lang.OutOfMemoryError":
1. Open Docker Desktop Settings.
2. Go to **Resources**.
3. Increase **Memory** to at least **4GB** (6GB recommended).
4. Apply & Restart.
This issue is particularly common on macOS when running emulators/simulators alongside Docker.

### Backend Connection
The mobile app connects to the backend API. Ensure your backend is running and accessible. When using Docker, you may need to configure the API host in your `.env` file or `app.json` to point to your machine's local IP address (not `localhost`) so the mobile device can reach it.

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
- **Push Notifications**: Get notified about request updates
- **Profile Management**: View and edit user profiles with ratings
- **Reviews & Ratings**: Rate and review completed interactions
- **Secure Authentication**: Token-based authentication with automatic logout
- **Offline Support**: Cached data for limited offline functionality

### Authentication & Storage

The app uses:
- **AsyncStorage** for local data persistence (tokens, user profiles, volunteer state)
- **Token-based authentication** with Django backend
- **Automatic logout** on invalid/expired tokens
- **Secure token storage** with automatic cleanup
