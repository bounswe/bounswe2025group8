# Testing Guide

This directory contains test setup files and utilities for the frontend application.

## Setup

Vitest is configured with the following features:
- **Testing Library**: React Testing Library for component testing
- **Environment**: jsdom for DOM simulation
- **Coverage**: v8 coverage provider
- **Global APIs**: `describe`, `it`, `expect` available globally

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('MyComponent', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Testing React Components

```typescript
import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from './utils';
import MyComponent from '../components/MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    renderWithProviders(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Redux

```typescript
import { renderWithProviders } from './utils';

const initialState = {
  auth: {
    isAuthenticated: true,
    user: { id: 1, name: 'Test User' }
  }
};

renderWithProviders(<MyComponent />, { preloadedState: initialState });
```

### Testing User Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('should handle button click', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MyComponent />);
  
  const button = screen.getByRole('button', { name: /submit/i });
  await user.click(button);
  
  expect(screen.getByText('Submitted')).toBeInTheDocument();
});
```

### Testing Async Operations

```typescript
import { waitFor } from '@testing-library/react';

it('should load data', async () => {
  renderWithProviders(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Test Files Organization

- Place test files next to the components they test: `Component.test.tsx`
- Or place them in `__tests__` directories
- Test files should end with `.test.ts` or `.test.tsx`

## Utilities

### `renderWithProviders`
Renders a component with Redux Provider and React Router

### `renderWithRouter`
Renders a component with just React Router (no Redux)

### `createMockStore`
Creates a mock Redux store with initial state

### Mock Data
Common mock data objects are available in `utils.tsx`:
- `mockUser`: A sample user object
- `mockAuthState`: Authenticated state
- `mockUnauthState`: Unauthenticated state

## Best Practices

1. **Test user behavior, not implementation details**
2. **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`
3. **Test accessibility**: Ensure proper ARIA labels and roles
4. **Mock external dependencies**: API calls, browser APIs
5. **Keep tests isolated**: Each test should be independent
6. **Use descriptive test names**: "should render user profile when authenticated"

## Common Patterns

### Mocking API calls

```typescript
import { vi } from 'vitest';

vi.mock('../services/api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ id: 1, name: 'Test' }))
}));
```

### Testing forms

```typescript
it('should submit form with valid data', async () => {
  const user = userEvent.setup();
  renderWithProviders(<MyForm />);
  
  await user.type(screen.getByLabelText(/email/i), 'test@example.com');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library User Event](https://testing-library.com/docs/user-event/intro)
