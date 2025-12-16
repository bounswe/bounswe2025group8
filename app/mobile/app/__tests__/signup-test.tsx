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

    test('renders correctly - shows key UI elements', () => {
        const { getByTestId } = render(<SignUp />);

        // Use testIDs for reliable element targeting
        expect(getByTestId('signup-fullname-input')).toBeTruthy();
        expect(getByTestId('signup-username-input')).toBeTruthy();
        expect(getByTestId('signup-phone-input')).toBeTruthy();
        expect(getByTestId('signup-email-input')).toBeTruthy();
        expect(getByTestId('signup-password-input')).toBeTruthy();
        expect(getByTestId('signup-button')).toBeTruthy();
        expect(getByTestId('signup-terms-checkbox')).toBeTruthy();
    });

    test('shows error if button pressed with empty fields', () => {
        const { getByTestId } = render(<SignUp />);
        const signUpButton = getByTestId('signup-button');
        const checkbox = getByTestId('signup-terms-checkbox');

        // Button should be disabled initially (terms not agreed)
        expect(signUpButton.props.accessibilityState?.disabled).toBe(true);

        // Agree to terms
        fireEvent.press(checkbox);

        // Now button should be enabled but fields empty
        fireEvent.press(signUpButton);

        // Alert should be called
        expect(Alert.alert).toHaveBeenCalled();
    });

    test('button is disabled when terms not agreed', () => {
        const { getByTestId } = render(<SignUp />);

        // Fill all fields
        fireEvent.changeText(getByTestId('signup-fullname-input'), 'Test User');
        fireEvent.changeText(getByTestId('signup-username-input'), 'testuser');
        fireEvent.changeText(getByTestId('signup-phone-input'), '1234567890');
        fireEvent.changeText(getByTestId('signup-email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('signup-password-input'), 'Password123!');

        const signUpButton = getByTestId('signup-button');

        // Button should still be disabled because terms not agreed
        expect(signUpButton.props.accessibilityState?.disabled).toBe(true);
    });

    test('validates password complexity', () => {
        const { getByTestId } = render(<SignUp />);

        // Agree to terms
        fireEvent.press(getByTestId('signup-terms-checkbox'));

        // Fill fields with weak password
        fireEvent.changeText(getByTestId('signup-fullname-input'), 'Test User');
        fireEvent.changeText(getByTestId('signup-username-input'), 'testuser');
        fireEvent.changeText(getByTestId('signup-phone-input'), '1234567890');
        fireEvent.changeText(getByTestId('signup-email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('signup-password-input'), 'weak');

        fireEvent.press(getByTestId('signup-button'));

        // Alert should be called (weak password)
        expect(Alert.alert).toHaveBeenCalled();
    });

    test('handles successful registration', async () => {
        (api.register as jest.Mock).mockResolvedValue({ status: 'success' });

        const { getByTestId } = render(<SignUp />);

        // Agree to terms
        fireEvent.press(getByTestId('signup-terms-checkbox'));

        // Fill fields with strong password
        fireEvent.changeText(getByTestId('signup-fullname-input'), 'Test User');
        fireEvent.changeText(getByTestId('signup-username-input'), 'testuser');
        fireEvent.changeText(getByTestId('signup-phone-input'), '1234567890');
        fireEvent.changeText(getByTestId('signup-email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('signup-password-input'), 'Password123!');

        fireEvent.press(getByTestId('signup-button'));

        await waitFor(() => {
            expect(api.register).toHaveBeenCalled();
        });
    });

    test('handles registration failure', async () => {
        (api.register as jest.Mock).mockRejectedValue({
            message: 'Email already exists',
            response: { data: { message: 'Email already exists' } }
        });

        const { getByTestId } = render(<SignUp />);

        // Agree to terms
        fireEvent.press(getByTestId('signup-terms-checkbox'));

        // Fill fields
        fireEvent.changeText(getByTestId('signup-fullname-input'), 'Test User');
        fireEvent.changeText(getByTestId('signup-username-input'), 'testuser');
        fireEvent.changeText(getByTestId('signup-phone-input'), '1234567890');
        fireEvent.changeText(getByTestId('signup-email-input'), 'test@example.com');
        fireEvent.changeText(getByTestId('signup-password-input'), 'Password123!');

        fireEvent.press(getByTestId('signup-button'));

        await waitFor(() => {
            expect(api.register).toHaveBeenCalled();
            expect(Alert.alert).toHaveBeenCalled();
        });
    });
});
