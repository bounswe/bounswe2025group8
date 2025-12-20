import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UserCard from '../../components/UserCard';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock useTheme
vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({
        colors: {
            background: {
                elevated: '#ffffff',
                primary: '#f5f5f5',
            },
            border: {
                primary: '#e0e0e0',
                focus: '#1976d2',
            },
            text: {
                primary: '#000000',
                secondary: '#666666',
            },
            brand: {
                primary: '#1976d2',
            },
        },
    }),
}));

// Mock useTranslation
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, params?: any) => {
            if (key === 'userCard.viewProfileOf') {
                return `View profile of ${params?.name}`;
            }
            if (key === 'userCard.unknownUser') {
                return 'Unknown User';
            }
            return key;
        },
    }),
}));

describe('UserCard', () => {
    const mockUser = {
        id: 1,
        name: 'John',
        surname: 'Doe',
        username: 'johndoe',
        rating: 4.5,
        reviewCount: 10,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should render user name', () => {
        render(
            <BrowserRouter>
                <UserCard user={mockUser} />
            </BrowserRouter>
        );
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render username', () => {
        render(
            <BrowserRouter>
                <UserCard user={mockUser} />
            </BrowserRouter>
        );
        expect(screen.getByText('@johndoe')).toBeInTheDocument();
    });

    it('should render rating', () => {
        render(
            <BrowserRouter>
                <UserCard user={mockUser} />
            </BrowserRouter>
        );
        expect(screen.getByLabelText('4.5 Stars')).toBeInTheDocument();
    });

    it('should render initials when no profile photo', () => {
        render(
            <BrowserRouter>
                <UserCard user={mockUser} />
            </BrowserRouter>
        );
        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('should navigate to user profile when clicked', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <UserCard user={mockUser} />
            </BrowserRouter>
        );

        const card = screen.getByRole('button', { name: /view profile of john doe/i });
        await user.click(card);

        expect(mockNavigate).toHaveBeenCalledWith('/profile/1');
    });

    it('should call custom onClick handler when provided', async () => {
        const user = userEvent.setup();
        const mockOnClick = vi.fn();

        render(
            <BrowserRouter>
                <UserCard user={mockUser} onClick={mockOnClick} />
            </BrowserRouter>
        );

        const card = screen.getByRole('button');
        await user.click(card);

        expect(mockOnClick).toHaveBeenCalledWith(mockUser);
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should handle keyboard navigation', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <UserCard user={mockUser} />
            </BrowserRouter>
        );

        const card = screen.getByRole('button');
        card.focus();
        await user.keyboard('{Enter}');

        expect(mockNavigate).toHaveBeenCalledWith('/profile/1');
    });

    it('should display "Unknown User" when name is missing', () => {
        const userWithoutName = {
            id: 2,
            username: 'user2',
        };

        render(
            <BrowserRouter>
                <UserCard user={userWithoutName} />
            </BrowserRouter>
        );

        // When no name, it shows username instead
        expect(screen.getByText('user2')).toBeInTheDocument();
    });

    it('should render profile photo when provided', () => {
        const userWithPhoto = {
            ...mockUser,
            profile_photo: 'https://example.com/photo.jpg',
        };

        render(
            <BrowserRouter>
                <UserCard user={userWithPhoto} />
            </BrowserRouter>
        );

        const avatar = screen.getByAltText('John Doe');
        expect(avatar).toHaveAttribute('src', 'https://example.com/photo.jpg');
    });
});
