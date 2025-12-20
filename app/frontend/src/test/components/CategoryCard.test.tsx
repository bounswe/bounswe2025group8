import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import CategoryCard from '../../components/CategoryCard';

vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({
        colors: {
            background: { elevated: '#ffffff' },
            text: { primary: '#000000' },
            shadow: { sm: 'rgba(0,0,0,0.1)', md: 'rgba(0,0,0,0.2)', lg: 'rgba(0,0,0,0.3)' },
            border: { focus: '#1976d2' },
        },
    }),
}));

describe('CategoryCard', () => {
    const mockOnClick = vi.fn();
    const defaultProps = {
        title: 'Cleaning',
        image: '/images/cleaning.jpg',
        onClick: mockOnClick,
    };

    it('renders category title and image', () => {
        renderWithProviders(<CategoryCard {...defaultProps} />);

        expect(screen.getByText('Cleaning')).toBeInTheDocument();
        expect(screen.getByAltText('Cleaning')).toBeInTheDocument();
        expect(screen.getByAltText('Cleaning')).toHaveAttribute('src', '/images/cleaning.jpg');
    });

    it('calls onClick when card is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryCard {...defaultProps} />);

        const card = screen.getByRole('button', { name: /viewCategory cleaning/i });
        await user.click(card);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick when Enter key is pressed', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryCard {...defaultProps} />);

        const card = screen.getByRole('button', { name: /viewCategory cleaning/i });
        card.focus();
        await user.keyboard('{Enter}');

        expect(mockOnClick).toHaveBeenCalled();
    });

    it('calls onClick when Space key is pressed', async () => {
        const user = userEvent.setup();
        renderWithProviders(<CategoryCard {...defaultProps} />);

        const card = screen.getByRole('button', { name: /viewCategory cleaning/i });
        card.focus();
        await user.keyboard(' ');

        expect(mockOnClick).toHaveBeenCalled();
    });

    it('is keyboard accessible with tabIndex', () => {
        renderWithProviders(<CategoryCard {...defaultProps} />);

        const card = screen.getByRole('button', { name: /viewCategory cleaning/i });
        expect(card).toHaveAttribute('tabIndex', '0');
    });

    it('applies custom className when provided', () => {
        renderWithProviders(<CategoryCard {...defaultProps} className="custom-class" />);

        const card = screen.getByRole('button', { name: /viewCategory cleaning/i });
        expect(card).toHaveClass('custom-class');
    });

    it('truncates long titles properly with line-clamp-2', () => {
        const longTitle = 'This is a very long category title that should be truncated at two lines';
        renderWithProviders(
            <CategoryCard {...defaultProps} title={longTitle} />
        );

        const titleElement = screen.getByText(longTitle);
        expect(titleElement).toHaveClass('line-clamp-2');
    });

    it('has proper aria-label for accessibility', () => {
        renderWithProviders(<CategoryCard {...defaultProps} />);

        const card = screen.getByRole('button', { name: /viewCategory cleaning/i });
        expect(card).toHaveAttribute('aria-label');
    });
});
