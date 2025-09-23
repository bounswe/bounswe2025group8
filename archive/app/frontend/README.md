# Neighborhood Assistance Board - Frontend

This is the frontend application for the Neighborhood Assistance Board project, built with React, Vite, Material UI, and Redux Toolkit.

## Features

- Modern React application with functional components and hooks
- Material UI for consistent, responsive design
- Redux Toolkit for state management
- React Router for navigation
- Comprehensive mock data system for development

## Getting Started

### Prerequisites

- Node.js 18+ and npm 

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Mock Data System

The frontend includes a comprehensive mock data system for development and testing purposes. This allows the frontend to be developed independently of the backend API.

### Key Components

- `/src/mock/mockData.js`: Contains all mock data entities (users, tasks, volunteers, etc.)
- `/src/services/mockServiceAdapter.js`: Service adapter that provides an API-like interface to the mock data
- `/src/utils/formatUtils.js`: Utility functions for formatting data for display
- `/src/pages/MockDataDemo.jsx`: Interactive demo page to showcase and test mock data

### Using Mock Data in Components

```jsx
// Import the mock service adapters
import { 
  mockTaskService, 
  mockUserService 
} from '../services/mockServiceAdapter';

// Example usage
const MyComponent = () => {
  const [tasks, setTasks] = useState([]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      const response = await mockTaskService.getTasks({});
      setTasks(response.tasks);
    };
    
    fetchTasks();
  }, []);
  
  return (
    // Component JSX
  );
}
```

### Mock Data Demo Page

The application includes an interactive demo page to showcase the mock data. Access it at:
- URL: `/mock-data`
- In development mode, there's a link in the sidebar

### Toggle Between Mock and Real API

In `src/services/mockServiceAdapter.js`, you can toggle between using mock data and real API calls:

```javascript
// Set to false to use real API endpoints instead of mock data
const USE_MOCK_DATA = true;
```

## Project Structure

- `/src/assets`: Static assets (images, icons)
- `/src/components`: Reusable UI components
- `/src/constants`: Application constants and enums
- `/src/hooks`: Custom React hooks
- `/src/layouts`: Page layout components
- `/src/mock`: Mock data for development
- `/src/pages`: Page components
- `/src/services`: API service adapters
- `/src/store`: Redux store configuration and slices
- `/src/theme`: Theme configuration
- `/src/utils`: Utility functions

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run lint`: Run ESLint
- `npm run preview`: Preview production build locally
- `npm run test`: Run tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:ui`: Run tests with UI
- `npm run test:coverage`: Run tests with coverage report

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
