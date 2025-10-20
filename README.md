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

[To be documented]

