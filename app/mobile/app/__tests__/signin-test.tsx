import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignIn from '../signin';
import * as api from '../../lib/api';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    useTheme: jest.fn(),
}));

jest.mock('../../lib/api');
jest.mock('../../lib/auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Spy on Alert
jest.spyOn(Alert, 'alert');

// Setup mocks
const mockUseRouter = require('expo-router').useRouter;
const mockUseTheme = require('@react-navigation/native').useTheme;
const mockUseAuth = require('../../lib/auth').useAuth;

describe('SignIn', () => {
    const mockRouter = {
        replace: jest.fn(),
        push: jest.fn(),
        back: jest.fn(),
        canGoBack: jest.fn(() => true),
    };

    const mockSetUser = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseRouter.mockReturnValue(mockRouter);
        mockUseTheme.mockReturnValue({
            colors: {
                primary: 'blue',
                background: 'white',
                text: 'black',
                border: 'gray',
                onPrimary: 'white',
            },
        });
        mockUseAuth.mockReturnValue({ setUser: mockSetUser });
    });

    test('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<SignIn />);
        expect(getByText('Welcome Back!')).toBeTruthy();
        // Note: Placeholders are custom text elements in this component, checking by text might be better
        expect(getByText('Email')).toBeTruthy();
        expect(getByText('Password')).toBeTruthy();
    });

    test('shows validation error if fields are empty', () => {
        const { getByText } = render(<SignIn />);
        const signInButton = getByText('Sign In');

        fireEvent.press(signInButton);

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
        expect(api.login).not.toHaveBeenCalled();
    });

    test('handles successful login', async () => {
        (api.login as jest.Mock).mockResolvedValue({
            data: { user_id: 123, token: 'abc' },
        });
        mockSetUser.mockResolvedValue(true);

        const { getByLabelText, getByText } = render(<SignIn />);

        fireEvent.changeText(getByLabelText('Email address input'), 'test@example.com');
        fireEvent.changeText(getByLabelText('Password input'), 'password123');

        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
            expect(mockSetUser).toHaveBeenCalledWith({ id: 123, email: 'test@example.com' });
            expect(mockRouter.replace).toHaveBeenCalledWith('/feed');
        });
    });

    test('handles login failure', async () => {
        (api.login as jest.Mock).mockRejectedValue({
            message: 'Invalid credentials',
            response: { data: { message: 'Invalid credentials' } }
        });

        const { getByLabelText, getByText } = render(<SignIn />);

        fireEvent.changeText(getByLabelText('Email address input'), 'test@example.com');
        fireEvent.changeText(getByLabelText('Password input'), 'wrongpassword');

        fireEvent.press(getByText('Sign In'));

        await waitFor(() => {
            expect(api.login).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Login Failed', 'Invalid credentials');
        });
    });
});
