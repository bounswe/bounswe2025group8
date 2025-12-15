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

    test('renders correctly - shows key UI elements', () => {
        const { getByTestId, getByText } = render(<SignIn />);

        // Use testIDs for reliable element targeting
        expect(getByTestId('signin-email-input')).toBeTruthy();
        expect(getByTestId('signin-password-input')).toBeTruthy();
        expect(getByTestId('signin-button')).toBeTruthy();

        // Translation keys are returned by i18n mock
        expect(getByText('auth.welcomeBack')).toBeTruthy();
    });

    test('shows validation error if fields are empty', () => {
        const { getByTestId } = render(<SignIn />);
        const signInButton = getByTestId('signin-button');

        fireEvent.press(signInButton);

        // Alert is called with translation keys
        expect(Alert.alert).toHaveBeenCalled();
        expect(api.login).not.toHaveBeenCalled();
    });

    test('handles successful login', async () => {
        (api.login as jest.Mock).mockResolvedValue({
            data: { user_id: 123, token: 'abc' },
        });
        mockSetUser.mockResolvedValue(true);

        const { getByTestId } = render(<SignIn />);

        fireEvent.changeText(getByTestId('signin-email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('signin-password-input'), 'password123');

        fireEvent.press(getByTestId('signin-button'));

        await waitFor(() => {
            expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
        });
    });

    test('handles login failure', async () => {
        (api.login as jest.Mock).mockRejectedValue({
            message: 'Invalid credentials',
            response: { data: { message: 'Invalid credentials' } }
        });

        const { getByTestId } = render(<SignIn />);

        fireEvent.changeText(getByTestId('signin-email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('signin-password-input'), 'wrongpassword');

        fireEvent.press(getByTestId('signin-button'));

        await waitFor(() => {
            expect(api.login).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalled();
        });
    });
});
