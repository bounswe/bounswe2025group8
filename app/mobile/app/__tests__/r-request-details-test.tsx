import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RequestDetails from '../r-request-details';
import * as api from '../../lib/api';

// Mock dependencies
jest.mock('expo-router', () => ({
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(),
}));

jest.mock('@react-navigation/native', () => {
    const React = require('react');
    return {
        useFocusEffect: jest.fn((callback) => React.useEffect(callback, [])),
    };
});

jest.mock('../../lib/api');
jest.mock('../../lib/auth', () => ({
    useAuth: jest.fn(),
}));

jest.mock('../../theme/ThemeProvider', () => ({
    useAppTheme: jest.fn(),
}));

jest.mock('../../components/forms/CategoryPicker', () => ({
    CategoryPicker: () => 'CategoryPicker',
}));
jest.mock('../../components/forms/DeadlinePicker', () => ({
    DeadlinePicker: () => 'DeadlinePicker',
}));
jest.mock('../../components/forms/AddressFields', () => ({
    AddressFields: () => 'AddressFields',
}));

// Spy on Alert
jest.spyOn(Alert, 'alert');

// Setup mocks
const mockUseLocalSearchParams = require('expo-router').useLocalSearchParams;
const mockUseRouter = require('expo-router').useRouter;
const mockUseAuth = require('../../lib/auth').useAuth;
const mockUseAppTheme = require('../../theme/ThemeProvider').useAppTheme;

describe('RequestDetails', () => {
    const mockRouter = {
        back: jest.fn(),
        push: jest.fn(),
        replace: jest.fn(),
        canGoBack: jest.fn(() => true),
    };

    const mockTheme = {
        tokens: {
            primary: 'blue',
            background: 'white',
            card: 'gray',
            text: 'black',
            error: 'red',
            border: 'lightgray',
            lightPurple: 'purple',
            labelDefaultBackground: 'lightgray',
            labelDefaultText: 'black',
            statusGenericBackground: 'gray',
            statusGenericText: 'white',
        },
    };

    const mockUser = {
        id: 1,
        name: 'Test User',
    };

    const mockTask = {
        id: 1,
        title: 'Test Task',
        description: 'Test Description',
        status: 'OPEN',
        status_display: 'Open',
        urgency_level: 2,
        creator: {
            id: 1,
            name: 'Test User',
        },
        volunteer_number: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseLocalSearchParams.mockReturnValue({ id: '1' });
        mockUseRouter.mockReturnValue(mockRouter);
        mockUseAuth.mockReturnValue({ user: mockUser });
        mockUseAppTheme.mockReturnValue(mockTheme);

        (api.getTaskDetails as jest.Mock).mockResolvedValue(mockTask);
        (api.getTaskApplicants as jest.Mock).mockResolvedValue({ status: 'success', data: { volunteers: [] } });
        (api.getTaskPhotos as jest.Mock).mockResolvedValue({ status: 'success', data: { photos: [] } });
    });

    test('renders task details after loading', async () => {
        const { getByText } = render(<RequestDetails />);

        await waitFor(() => {
            expect(getByText('Test Task')).toBeTruthy();
            expect(getByText('Test Description')).toBeTruthy();
        });
    });

    test('handles error when task fetch fails', async () => {
        (api.getTaskDetails as jest.Mock).mockRejectedValue(new Error('Fetch failed'));

        const { getByText } = render(<RequestDetails />);

        await waitFor(() => {
            expect(getByText('Fetch failed')).toBeTruthy();
        });
    });

    test('allows creator to mark as complete', async () => {
        // Mock task with volunteers so "Mark as Complete" is available
        const taskWithVolunteers = { ...mockTask, volunteer_number: 1 };
        (api.getTaskDetails as jest.Mock).mockResolvedValue(taskWithVolunteers);
        (api.getTaskApplicants as jest.Mock).mockResolvedValue({
            status: 'success',
            data: {
                volunteers: [{ id: 1, user: { id: 2, name: 'Volunteer' } }]
            }
        });

        const { getByText } = render(<RequestDetails />);

        await waitFor(() => expect(getByText('Mark as Complete')).toBeTruthy());

        fireEvent.press(getByText('Mark as Complete'));

        expect(Alert.alert).toHaveBeenCalledWith(
            'Mark as Complete',
            expect.any(String),
            expect.any(Array)
        );
    });
});
