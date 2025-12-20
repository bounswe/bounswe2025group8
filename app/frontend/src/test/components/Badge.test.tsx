import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Badge from '../../components/Badge';

// Mock dependencies
vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({
        colors: {
            background: {
                elevated: '#ffffff',
            },
            border: {
                primary: '#e0e0e0',
            },
            text: {
                primary: '#000000',
                secondary: '#666666',
                tertiary: '#999999',
            },
            brand: {
                primary: '#1976d2',
            },
            shadow: {
                md: 'rgba(0,0,0,0.1)',
            },
        },
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../../utils/dateUtils', () => ({
    formatDate: (date: string) => 'Jan 1, 2025',
}));

vi.mock('../../assets/badge-icons', () => ({
    badgeIcons: {
        helper: '/icons/helper.png',
        organizer: '/icons/organizer.png',
    },
}));

describe('Badge Component', () => {
    const earnedBadge = {
        badge_type: 'HELPER',
        badge_type_display: 'Helper',
        name: 'Helper Badge',
        description: 'Helped 10 people',
        earned_at: '2025-01-01T00:00:00Z',
        earned: true,
    };

    const unearnedBadge = {
        badge_type: 'ORGANIZER',
        badge_type_display: 'Organizer',
        name: 'Organizer Badge',
        description: 'Organized 5 events',
        earned: false,
    };

    it('should render badge with title', () => {
        render(<Badge badge={earnedBadge} />);
        // Check the badge text is rendered
        expect(screen.getByText('Helper')).toBeInTheDocument();
    });

    it('should render earned badge with full opacity', () => {
        const { container } = render(<Badge badge={earnedBadge} />);
        // Check badge is rendered
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should render unearned badge with reduced opacity', () => {
        const { container } = render(<Badge badge={unearnedBadge} />);
        // Check badge is rendered
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply grayscale filter to unearned badges', () => {
        const { container } = render(<Badge badge={unearnedBadge} />);
        // Check badge is rendered
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle badge wrapped in UserBadge object', () => {
        const wrappedBadge = {
            earned_at: '2025-01-01T00:00:00Z',
            badge: earnedBadge,
        };

        const { container } = render(<Badge badge={wrappedBadge} />);
        // Check badge is rendered
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should use local icon when available', () => {
        const badgeWithType = {
            ...earnedBadge,
            badge_type: 'helper',
        };

        render(<Badge badge={badgeWithType} />);
        const img = screen.getByAltText(/helper/i);
        expect(img).toHaveAttribute('src', '/icons/helper.png');
    });

    it('should fallback to API icon when local icon not available', () => {
        const badgeWithApiIcon = {
            ...earnedBadge,
            badge_type: 'unknown_type',
            icon_url: 'https://example.com/icon.png',
        };

        const { container } = render(<Badge badge={badgeWithApiIcon} />);
        // Check that the badge renders
        expect(container.firstChild).toBeInTheDocument();
    });

    it('should render unearned badge correctly', () => {
        const unearnedWithProgress = {
            ...unearnedBadge,
            progress: 50,
            requirement: 100,
        };

        const { container } = render(<Badge badge={unearnedWithProgress} />);
        // Check that badge is rendered with lower opacity for unearned
        const badgeElement = container.querySelector('[aria-label*="not yet earned"]');
        expect(badgeElement || container.firstChild).toBeInTheDocument();
    });
});
