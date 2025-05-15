# Neighborhood Assistance Board Mock Data

This directory contains realistic mock data for the Neighborhood Assistance Board application demo.

## Available Mock Data

The mock data includes:

1. **Users**: Mock user accounts with profiles, ratings, and contact information
2. **Tasks**: Assistance requests with categories, descriptions, deadlines, and other details
3. **Volunteers**: Applications by users to volunteer for tasks
4. **Notifications**: System messages for various actions in the application
5. **Reviews**: Ratings and feedback between users after task completion
6. **Categories**: Task categories with descriptions and icons
7. **Statistics**: Platform statistics for dashboards

## How to Use the Mock Data

### Option 1: Direct Import (for quick testing)

```js
// Import directly from mockData.js
import { mockUsers, mockTasks, mockVolunteers } from '../mock/mockData';

// Use the data in your component
const MyComponent = () => {
  // Example: get the first user
  const user = mockUsers[0];
  
  return (
    <div>
      <h2>{user.name} {user.surname}</h2>
      <p>Rating: {user.rating}/5</p>
    </div>
  );
};
```

### Option 2: Service Adapter (recommended)

For a more realistic approach that will make it easier to switch to real API calls later:

```js
// Import service from mockServiceAdapter
import { userService, taskService } from '../services/mockServiceAdapter';

// Use the service in your component
const UserProfile = ({ userId }) => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await userService.getUserById(userId);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, [userId]);
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>{user.name} {user.surname}</h2>
      <p>Rating: {user.rating}/5</p>
    </div>
  );
};
```

### Examples

See the examples in `src/examples/MockDataExamples.jsx` for more detailed usage examples, including:

- Listing tasks with pagination
- Displaying task details and volunteer management
- User profiles with reviews
- Notifications with read/unread status
- Categories and statistics

## Switching to Real API

When you're ready to switch from mock data to real API calls, simply set the `USE_MOCK_DATA` constant to `false` in `mockServiceAdapter.js` and implement the real API calls in the service functions.

```js
// In mockServiceAdapter.js
const USE_MOCK_DATA = false;
```

## Format Utilities

You can use the formatting utilities in `src/utils/formatUtils.js` to format dates, ratings, statuses, and other data consistently across your application.
