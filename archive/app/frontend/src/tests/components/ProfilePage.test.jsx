import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import React from 'react'
import ProfilePage from '../../components/ProfilePage/ProfilePage'

vi.mock('../../redux/slices/profileSlice', () => ({
  fetchUserProfile: () => ({ type: 'profile/fetchUserProfile' }),
  fetchUserReviews: () => ({ type: 'profile/fetchUserReviews' }),
  fetchUserCreatedRequests: () => ({ type: 'profile/fetchUserCreatedRequests' }),
  fetchUserVolunteeredRequests: () => ({ type: 'profile/fetchUserVolunteeredRequests' }),
  fetchUserBadges: () => ({ type: 'profile/fetchUserBadges' }),
}))

const createMockStore = (profileOverrides = {}) => {
  const defaultState = {
    profile: {
      loading: false,
      user: { name: 'Batuhan Büber', rating: 4.7, reviewsCount: 12 },
      reviews: Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        reviewer: `User ${i + 1}`,
        comment: 'Great!',
        rating: 5,
        date: '2025-01-01T00:00:00Z',
      })),

    // volunteer
    volunteeredRequests: [
     { id: 1, title: 'Help me to see a doctor', urgency: 'High', completed: false },  // active
     { id: 2, title: 'Garden help needed',      urgency: 'Low',  completed: true  },  // past
   ],

   // requester
   createdRequests: [
     { id: 3, title: 'Help me to see a doctor', urgency: 'High', completed: false },
   ],
      badges: [],
      ...profileOverrides,
    },
  }

  return {
    getState: () => defaultState,
    subscribe: vi.fn(),
    dispatch: vi.fn(),
  }
}

// Helper to render with Provider + MemoryRouter
const renderWithStore = (ui, { profileOverrides } = {}) => {
  const store = createMockStore(profileOverrides)
  return render(
    <Provider store={store}>
      <MemoryRouter>{ui}</MemoryRouter>
    </Provider>
  )
}

// Tests
describe('ProfilePage', () => {
  it('renders user profile information correctly', () => {
    renderWithStore(<ProfilePage />)

    expect(screen.getByText('Batuhan Büber')).toBeInTheDocument()
    expect(screen.getByText(/4\.7 \(12 reviews\)/)).toBeInTheDocument()
  })

  it('switches between Volunteer and Requester tabs', () => {
    renderWithStore(<ProfilePage />)

    // Starts on Volunteer tab
    expect(screen.getByText('Active Volunteering')).toBeInTheDocument()

    // Click Requester
    fireEvent.click(screen.getByText('Requester'))

    expect(screen.getByText('Active Requests')).toBeInTheDocument()
    expect(screen.getByText('Help me to see a doctor')).toBeInTheDocument()
  })

  it('switches between Active and Past requests tabs', () => {
  renderWithStore(<ProfilePage />);
  
  fireEvent.click(screen.getByText('Volunteer'));
  
  fireEvent.click(screen.getByText('Past Volunteering'));
  
  expect(screen.getByText('Garden help needed')).toBeInTheDocument();
});

  it('shows loading state when data is being fetched', () => {
    renderWithStore(<ProfilePage />, { profileOverrides: { loading: true } })

    expect(screen.getByText('Loading profile...')).toBeInTheDocument()
  })

  it('shows empty state when there are no active requests', () => {
    renderWithStore(<ProfilePage />, { profileOverrides: { volunteeredRequests: [] } })

    expect(
      screen.getByText("You're not volunteering for any tasks yet")
    ).toBeInTheDocument()
  })
})
