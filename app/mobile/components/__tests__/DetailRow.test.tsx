import React from 'react';
import { render } from '@testing-library/react-native';
import { DetailRow } from '../DetailRow';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

const mockThemeColors: any = {
    text: '#000000',
    textMuted: '#888888',
};

describe('DetailRow', () => {
    it('renders label variant correctly', () => {
        const { getByText } = render(
            <DetailRow
                label="Test Label"
                value="Test Value"
                themeColors={mockThemeColors}
            />
        );

        expect(getByText('Test Label')).toBeTruthy();
        expect(getByText('Test Value')).toBeTruthy();
    });

    it('renders icon variant correctly', () => {
        const { getByText } = render(
            <DetailRow
                icon="time-outline"
                value="Test Icon Value"
                themeColors={mockThemeColors}
            />
        );

        expect(getByText('Test Icon Value')).toBeTruthy();
    });

    it('renders with testID', () => {
        const { getByTestId } = render(
            <DetailRow
                label="Test"
                value="Value"
                themeColors={mockThemeColors}
                testID="test-row"
            />
        );

        expect(getByTestId('test-row')).toBeTruthy();
    });
});
