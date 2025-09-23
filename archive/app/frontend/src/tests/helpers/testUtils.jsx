import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

// Helper function to render components with Redux and Router
export function renderWithProviders(ui, mockStore = {}) {
  return render(
    <Provider store={mockStore}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
}

// Create mock profile data for testing
export const mockProfileData = {
  user: {
    id: '123',
    name: 'Batuhan Büber',
    profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4.7,
    reviewCount: 12
  },
  reviews: [
    {
      id: '1',
      reviewer: {
        id: '101',
        name: 'Matthew Brown',
        profilePicture: 'https://randomuser.me/api/portraits/men/33.jpg',
      },
      rating: 5,
      date: '2025-05-13',
      comment: 'Great service!'
    }
  ],
  createdRequests: [
    {
      id: '1',
      title: 'Help me to see a doctor',
      image: '/doctor-request.jpg',
      category: 'Healthcare',
      distance: '2 km',
      timeAgo: '3 hours ago',
      urgency: 'High',
      status: 'Accepted',
      completed: false
    }
  ],
  volunteeredRequests: [
    {
      id: '4',
      title: 'Garden help needed',
      image: '/garden-help.jpg',
      category: 'Gardening',
      distance: '3.5 km',
      timeAgo: '1 week ago',
      urgency: 'Low',
      status: 'Completed',
      completed: true
    }
  ],
  badges: [
    {
      id: 'badge1',
      title: 'First Steps',
      description: 'Completed 5 tasks',
      image: 'https://cdn-icons-png.flaticon.com/128/3113/3113019.png',
      color: '#FF9800',
      earned: true,
      earnedDate: '2025-02-15'
    }
  ],
  loading: false,
  error: null
};

// Setup mock Redux hooks
export const setupReduxMocks = (customState = {}) => {
  const state = { profile: { ...mockProfileData, ...customState } };
  
  vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
      ...actual,
      useDispatch: () => vi.fn(),
      useSelector: vi.fn(selector => selector(state))
    };
  });
  
  return state;
};