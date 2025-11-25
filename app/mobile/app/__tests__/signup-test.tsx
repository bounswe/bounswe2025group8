import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import SignUp from '../signup';
import * as api from '../../lib/api';

// Mock dependencies
jest.mock('expo-router', () => ({
    useRouter: jest.fn(),
    useLocalSearchParams: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const React = require('react');
    return {
        useTheme: jest.fn(),
        useFocusEffect: jest.fn((callback) => React.useEffect(callback, [])),
    };
});

jest.mock('../../lib/api');

jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Spy on Alert
jest.spyOn(Alert, 'alert');

// Setup mocks
const mockUseRouter = require('expo-router').useRouter;
const mockUseTheme = require('@react-navigation/native').useTheme;

describe('SignUp', () => {
    const mockRouter = {
        replace: jest.fn(),
        push: jest.fn(),
        back: jest.fn(),
    };

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
                icon: 'gray',
                textMuted: 'lightgray',
            },
        });
    });

    test('renders correctly', () => {
        const { getByText, getByPlaceholderText } = render(<SignUp />);
        expect(getByText('Create Account')).toBeTruthy();
        expect(getByPlaceholderText('Full Name')).toBeTruthy();
        expect(getByPlaceholderText('Username')).toBeTruthy();
        expect(getByPlaceholderText('Phone')).toBeTruthy();
        expect(getByPlaceholderText('Email')).toBeTruthy();
        expect(getByPlaceholderText('Password')).toBeTruthy();
    });

    test('shows error if fields are empty', () => {
        const { getByTestId, getByRole } = render(<SignUp />);
        const signUpButton = getByTestId('signup-button');

        // Button should be disabled initially
        expect(signUpButton.props.accessibilityState.disabled).toBe(true);

        // Agree to terms
        const checkbox = getByRole('checkbox');
        fireEvent.press(checkbox);

        // Now button should be enabled
        expect(signUpButton.props.accessibilityState.disabled).toBe(false);

        fireEvent.press(signUpButton);

        expect(Alert.alert).toHaveBeenCalledWith('Error', 'Please fill in all fields');
    });

    test('shows error if terms not agreed', () => {
        const { getByTestId, getByPlaceholderText } = render(<SignUp />);

        // Fill fields
        fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
        fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
        fireEvent.changeText(getByPlaceholderText('Phone'), '1234567890');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password123!');

        const signUpButton = getByTestId('signup-button');

        // Verify button is disabled
        expect(signUpButton.props.accessibilityState?.disabled).toBe(true);
        // Also check the disabled prop directly if possible, but accessibilityState is what we explicitly passed

        // Try to press
        fireEvent.press(signUpButton);

        // Since button is disabled, onPress should not fire, so no Alert
        expect(Alert.alert).not.toHaveBeenCalled();
    });

    test('validates password complexity', () => {
        const { getByTestId, getByPlaceholderText, getByRole } = render(<SignUp />);

        // Agree to terms
        fireEvent.press(getByRole('checkbox'));

        // Fill fields
        fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
        fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
        fireEvent.changeText(getByPlaceholderText('Phone'), '1234567890');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');

        // Weak password
        fireEvent.changeText(getByPlaceholderText('Password'), 'weak');

        fireEvent.press(getByTestId('signup-button'));

        expect(Alert.alert).toHaveBeenCalledWith('Error', expect.stringContaining('Password must'));
    });

    test('handles successful registration', async () => {
        (api.register as jest.Mock).mockResolvedValue({ status: 'success' });

        const { getByTestId, getByPlaceholderText, getByRole } = render(<SignUp />);

        // Agree to terms
        fireEvent.press(getByRole('checkbox'));

        // Fill fields
        fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
        fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
        fireEvent.changeText(getByPlaceholderText('Phone'), '1234567890');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password123!');

        fireEvent.press(getByTestId('signup-button'));

        await waitFor(() => {
            expect(api.register).toHaveBeenCalledWith(
                'test@example.com',
                'Password123!',
                'Test User',
                'testuser',
                '1234567890'
            );
            expect(Alert.alert).toHaveBeenCalledWith(
                'Success',
                'Registration successful! Please log in.',
                expect.any(Array)
            );
        });
    });

    test('handles registration failure', async () => {
        (api.register as jest.Mock).mockRejectedValue({
            message: 'Email already exists',
            response: { data: { message: 'Email already exists' } }
        });

        const { getByTestId, getByPlaceholderText, getByRole } = render(<SignUp />);

        // Agree to terms
        fireEvent.press(getByRole('checkbox'));

        // Fill fields
        fireEvent.changeText(getByPlaceholderText('Full Name'), 'Test User');
        fireEvent.changeText(getByPlaceholderText('Username'), 'testuser');
        fireEvent.changeText(getByPlaceholderText('Phone'), '1234567890');
        fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
        fireEvent.changeText(getByPlaceholderText('Password'), 'Password123!');

        fireEvent.press(getByTestId('signup-button'));

        await waitFor(() => {
            expect(api.register).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalledWith('Registration Failed', 'Email already exists');
        });
    });
});
