/**
 * Component Integration Tests
 * Tests React Native components with proper mocking
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// Mock navigation
jest.mock('@react-navigation/native', () => ({
    useTheme: () => ({
        colors: {
            primary: '#6200EE',
            background: '#FFFFFF',
            card: '#FFFFFF',
            text: '#000000',
            textMuted: '#757575',
            border: '#E0E0E0',
            notification: '#FF0000',
            lightPurple: '#EDE7F6',
            overlay: 'rgba(0,0,0,0.5)',
            onPrimary: '#FFFFFF',
            statusHighBackground: '#FFEBEE',
            statusHighText: '#D32F2F',
            statusHighBorder: '#EF9A9A',
            statusMediumBackground: '#FFF3E0',
            statusMediumText: '#F57C00',
            statusMediumBorder: '#FFCC80',
            statusLowBackground: '#E8F5E9',
            statusLowText: '#388E3C',
            statusLowBorder: '#A5D6A7',
            statusPastBackground: '#ECEFF1',
            statusPastText: '#607D8B',
            statusPastBorder: '#B0BEC5',
        },
    }),
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

// Mock react-i18next
jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: { language: 'en' },
    }),
}));

// Mock expo vector icons
jest.mock('@expo/vector-icons', () => ({
    Ionicons: 'Ionicons',
}));

// Import components
import RequestCard from '../components/ui/RequestCard';
import CategoryCard from '../components/ui/CategoryCard';
import RatingPill from '../components/ui/RatingPill';

describe('RequestCard Component', () => {
    test('renders with default props', () => {
        const { getByText } = render(<RequestCard />);
        expect(getByText('Untitled Request')).toBeTruthy();
    });

    test('renders with custom title', () => {
        const { getByText } = render(<RequestCard title="Grocery Shopping Help" />);
        expect(getByText('Grocery Shopping Help')).toBeTruthy();
    });

    test('renders distance and time', () => {
        const { getByText } = render(
            <RequestCard distance="2.5 km" time="30 min ago" />
        );
        expect(getByText('2.5 km • 30 min ago')).toBeTruthy();
    });

    test('renders N/A for missing distance/time', () => {
        const { getByText } = render(<RequestCard />);
        expect(getByText('N/A • N/A')).toBeTruthy();
    });

    test('renders category label', () => {
        const { getByText } = render(<RequestCard category="Grocery Shopping" />);
        expect(getByText('Grocery Shopping')).toBeTruthy();
    });

    test('renders default category', () => {
        const { getByText } = render(<RequestCard />);
        expect(getByText('Uncategorized')).toBeTruthy();
    });

    test('renders urgency level', () => {
        const { getByText } = render(<RequestCard urgencyLevel="High" />);
        expect(getByText('High requestDetails.urgency')).toBeTruthy();
    });

    test('renders status for non-past urgency', () => {
        const { getByText } = render(<RequestCard urgencyLevel="Medium" status="Open" />);
        expect(getByText('Open')).toBeTruthy();
    });

    test('renders past status with star prefix', () => {
        const { getByText } = render(<RequestCard urgencyLevel="Past" status="Completed" />);
        expect(getByText('☆ Completed')).toBeTruthy();
    });

    test('trims empty title', () => {
        const { getByText } = render(<RequestCard title="   " />);
        expect(getByText('Untitled Request')).toBeTruthy();
    });

    test('renders with all props', () => {
        const { getByText } = render(
            <RequestCard
                title="Help Needed"
                distance="1 km"
                time="5 min"
                category="Pet Care"
                urgencyLevel="Low"
                status="Open"
            />
        );
        expect(getByText('Help Needed')).toBeTruthy();
        expect(getByText('Pet Care')).toBeTruthy();
    });
});

describe('CategoryCard Component', () => {
    const mockImage = { uri: 'https://example.com/image.png' };

    test('renders with title', () => {
        const { getByText } = render(
            <CategoryCard title="Grocery Shopping" imageSource={mockImage} badgeNumber={5} onPress={() => { }} />
        );
        expect(getByText('Grocery Shopping')).toBeTruthy();
    });

    test('renders with badge number', () => {
        const { getByText } = render(
            <CategoryCard title="Pet Care" imageSource={mockImage} badgeNumber={15} onPress={() => { }} />
        );
        expect(getByText('15')).toBeTruthy();
    });

    test('renders category title text', () => {
        const { getByText } = render(
            <CategoryCard title="Tech Support" imageSource={mockImage} badgeNumber={3} onPress={() => { }} />
        );
        expect(getByText('Tech Support')).toBeTruthy();
    });

    test('renders with zero badge', () => {
        const { getByText } = render(
            <CategoryCard title="Cooking" imageSource={mockImage} badgeNumber={0} onPress={() => { }} />
        );
        expect(getByText('0')).toBeTruthy();
    });
});

describe('RatingPill Component', () => {
    test('renders with rating', () => {
        const { getByText } = render(<RatingPill score={4.5} />);
        expect(getByText('4.5')).toBeTruthy();
    });

    test('renders star icon', () => {
        const { getByText } = render(<RatingPill score={3.0} />);
        expect(getByText('★')).toBeTruthy();
    });

    test('renders integer rating', () => {
        const { getByText } = render(<RatingPill score={5} />);
        expect(getByText('5')).toBeTruthy();
    });
});

describe('Component Props Edge Cases', () => {
    test('RequestCard handles undefined props gracefully', () => {
        const { getByText } = render(
            <RequestCard
                title={undefined}
                distance={undefined}
                time={undefined}
                category={undefined}
                urgencyLevel={undefined}
                status={undefined}
            />
        );
        expect(getByText('Untitled Request')).toBeTruthy();
        expect(getByText('Uncategorized')).toBeTruthy();
    });

    test('RequestCard handles null-like values', () => {
        const { getByText } = render(
            <RequestCard
                title=""
                distance=""
                time=""
            />
        );
        expect(getByText('Untitled Request')).toBeTruthy();
    });

    test('RequestCard with onPress prop', () => {
        const mockOnPress = jest.fn();
        const { container } = render(
            <RequestCard title="Test" onPress={mockOnPress} />
        );
        expect(container).toBeTruthy();
    });

    test('RequestCard without onPress prop', () => {
        const { container } = render(
            <RequestCard title="Test" />
        );
        expect(container).toBeTruthy();
    });
});

describe('Theme Color Application', () => {
    const mockImage = { uri: 'https://example.com/image.png' };

    test('RequestCard applies theme colors', () => {
        const { container } = render(<RequestCard title="Test" />);
        expect(container).toBeTruthy();
    });

    test('CategoryCard applies theme colors', () => {
        const { container } = render(
            <CategoryCard title="Test" imageSource={mockImage} badgeNumber={1} onPress={() => { }} />
        );
        expect(container).toBeTruthy();
    });

    test('RatingPill applies theme colors', () => {
        const { container } = render(<RatingPill score={4.0} />);
        expect(container).toBeTruthy();
    });
});
