import * as React from 'react';
import { render } from '@testing-library/react-native';
import { ThemedText } from '../themed-text';

// Mock the useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

test('renders correctly', () => {
    const { getByText } = render(<ThemedText>Snapshot test!</ThemedText>);
    expect(getByText('Snapshot test!')).toBeTruthy();
});

test('applies title style', () => {
    const { getByText } = render(<ThemedText type="title">Title</ThemedText>);
    const textComponent = getByText('Title');
    expect(textComponent.props.style).toEqual(
        expect.arrayContaining([
            expect.objectContaining({ fontSize: 32, fontWeight: 'bold' }),
        ])
    );
});
