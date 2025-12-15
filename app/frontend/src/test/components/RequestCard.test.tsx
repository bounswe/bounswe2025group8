import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import RequestCard from '../../components/RequestCard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'requestCard.urgency' && params?.level) {
                return params.level;
            }
            return key;
        },
    }),
}));

vi.mock('../../utils/dateUtils', () => ({
    formatRelativeTime: (date: string) => '5 days ago',
}));

vi.mock('../../constants/categories', () => ({
    categoryMapping: {},
    getCategoryName: (category: string) => category.charAt(0).toUpperCase() + category.slice(1),
}));

vi.mock('../../constants/urgency_level', () => ({
    urgencyLevels: {
        1: { name: 'Low', color: '#4caf50' },
        2: { name: 'Low-Medium', color: '#8bc34a' },
        3: { name: 'Medium', color: '#ff9800' },
        4: { name: 'High', color: '#f44336' },
        5: { name: 'Critical', color: '#d32f2f' },
    },
    getUrgencyLevelName: (level: number) => {
        const levels: { [key: number]: string } = {
            1: 'Low',
            2: 'Low-Medium',
            3: 'Medium',
            4: 'High',
            5: 'Critical',
        };
        return levels[level] || 'Unknown';
    },
}));

vi.mock('../../utils/taskUtils', () => ({
    extractRegionFromLocation: (location: string) => location,
}));

vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({
        colors: {
            background: { elevated: '#ffffff', primary: '#f5f5f5', secondary: '#e0e0e0' },
            text: { primary: '#000000', secondary: '#666666', tertiary: '#999999' },
            border: { primary: '#e0e0e0', focus: '#1976d2' },
            brand: { primary: '#1976d2' },
            semantic: { success: '#4caf50', error: '#f44336', warning: '#ff9800' },
            shadow: { sm: 'rgba(0,0,0,0.1)', md: 'rgba(0,0,0,0.2)', lg: 'rgba(0,0,0,0.3)' },
            interactive: { hover: '#f0f0f0' },
        },
    }),
}));

describe('RequestCard', () => {
    const mockOnClick = vi.fn();
    const mockRequest = {
        id: '1',
        title: 'Help with grocery shopping',
        category: 'shopping',
        urgency_level: 3,
        created_at: '2024-01-01T10:00:00Z',
        deadline: '2024-01-10T10:00:00Z',
        location: 'Istanbul, Turkey',
        imageUrl: '/images/shopping.jpg',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders request title', () => {
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        expect(screen.getByText('Help with grocery shopping')).toBeInTheDocument();
    });

    it('displays category badge', () => {
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        // Category badge shows "Shopping" (capitalized)
        const badges = screen.getAllByText(/shopping/i);
        expect(badges.length).toBeGreaterThan(0);
    });

    it('displays urgency level', () => {
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        // Urgency level should be visible (medium urgency = 3)
        // The urgency button shows the level name
        const urgencyElement = screen.getByText('Medium');
        expect(urgencyElement).toBeInTheDocument();
    });

    it('displays location information', () => {
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        expect(screen.getByText(/istanbul/i)).toBeInTheDocument();
    });

    it('displays formatted creation time', () => {
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        // Should show relative time like "5 days ago" or similar
        // There are multiple "ago" texts (deadline + created_at), so use getAllByText
        const timeElements = screen.getAllByText(/ago/i);
        expect(timeElements.length).toBeGreaterThan(0);
    });

    it('calls onClick when card is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        // The card has aria-label from t('requestCard.viewRequest')
        const card = screen.getByRole('button', { name: /requestCard.viewRequest/i });
        await user.click(card);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('navigates to category filter when category badge is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <RequestCard request={mockRequest} onClick={mockOnClick} />
        );

        // Category button has aria-label with filterByCategory
        const categoryBadge = screen.getByRole('button', { name: /filterByCategory/i });
        await user.click(categoryBadge);

        expect(mockNavigate).toHaveBeenCalledWith('/requests?category=shopping');
        // Should not trigger the card's onClick
        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('navigates to urgency filter when urgency badge is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(
            <RequestCard request={mockRequest} onClick={mockOnClick} />
        );

        // Urgency button has aria-label with filterByUrgency
        const urgencyBadge = screen.getByRole('button', { name: /filterByUrgency/i });
        await user.click(urgencyBadge);

        expect(mockNavigate).toHaveBeenCalledWith('/requests?urgency_level=3');
        // Should not trigger the card's onClick
        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('renders image when imageUrl is provided', () => {
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        const image = screen.getByAltText(/help with grocery shopping/i);
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', '/images/shopping.jpg');
    });

    it('handles request without image gracefully', () => {
        const requestWithoutImage = { ...mockRequest, imageUrl: null };
        renderWithProviders(<RequestCard request={requestWithoutImage} onClick={mockOnClick} />);

        expect(screen.getByText('Help with grocery shopping')).toBeInTheDocument();
        expect(screen.queryByAltText(/help with grocery shopping/i)).not.toBeInTheDocument();
    });

    it('handles nested urgency level in task object', () => {
        const requestWithNestedUrgency = {
            ...mockRequest,
            urgency_level: undefined,
            task: { urgency_level: 4 },
        };

        renderWithProviders(
            <RequestCard request={requestWithNestedUrgency} onClick={mockOnClick} />
        );

        expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('is keyboard accessible', async () => {
        const user = userEvent.setup();
        renderWithProviders(<RequestCard request={mockRequest} onClick={mockOnClick} />);

        const card = screen.getByRole('button', { name: /requestCard.viewRequest/i });
        card.focus();
        await user.keyboard('{Enter}');

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className when provided', () => {
        renderWithProviders(
            <RequestCard request={mockRequest} onClick={mockOnClick} className="custom-class" />
        );

        const card = screen.getByRole('button', { name: /requestCard.viewRequest/i });
        expect(card).toHaveClass('custom-class');
    });
});
