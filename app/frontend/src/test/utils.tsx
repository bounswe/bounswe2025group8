import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Import your reducers here
// import authReducer from '../features/authentication/store/authSlice';
// import profileReducer from '../features/profile/store/profileSlice';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    preloadedState?: any;
    store?: any;
    route?: string;
}

/**
 * Custom render function that includes common providers
 * Usage: renderWithProviders(<MyComponent />)
 */
export function renderWithProviders(
    ui: ReactElement,
    {
        preloadedState = {},
        // Automatically create a store instance if no store was passed in
        store = configureStore({
            reducer: {
                // Add your reducers here
                // auth: authReducer,
                // profile: profileReducer,
            },
            preloadedState,
        }),
        route = '/',
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    // Set the route
    window.history.pushState({}, 'Test page', route);

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <Provider store={store}>
                <BrowserRouter>{children}</BrowserRouter>
            </Provider>
        );
    }

    return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

/**
 * Simple wrapper with just Router (no Redux)
 * Usage: renderWithRouter(<MyComponent />)
 */
export function renderWithRouter(
    ui: ReactElement,
    { route = '/' }: { route?: string } = {}
) {
    window.history.pushState({}, 'Test page', route);

    return render(ui, { wrapper: BrowserRouter });
}

/**
 * Create a mock store for testing
 */
export function createMockStore(initialState = {}) {
    return configureStore({
        reducer: {
            // Add your reducers here
            // auth: authReducer,
            // profile: profileReducer,
        },
        preloadedState: initialState,
    });
}

/**
 * Mock user data for tests
 */
export const mockUser = {
    id: 1,
    name: 'Test',
    surname: 'User',
    email: 'test@example.com',
    username: 'testuser',
    phone: '1234567890',
};

/**
 * Mock authenticated state
 */
export const mockAuthState = {
    isAuthenticated: true,
    user: mockUser,
    loading: false,
    error: null,
};

/**
 * Mock unauthenticated state
 */
export const mockUnauthState = {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
};
