import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils';
import Sidebar from '../../components/Sidebar';

const mockNavigate = vi.fn();
const mockLogout = vi.fn();
let mockUseAuth: any;

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('../../features/authentication/hooks/useAuth', () => ({
    default: () => mockUseAuth(),
}));

vi.mock('../../features/notification', () => ({
    useUnreadCount: () => ({ unreadCount: 0 }),
}));

vi.mock('../../hooks/useTheme', () => ({
    useTheme: () => ({
        colors: {
            background: { primary: '#ffffff', secondary: '#f5f5f5' },
            text: { primary: '#000000', secondary: '#666666', inverted: '#ffffff' },
            border: { primary: '#e0e0e0', focus: '#1976d2' },
            brand: { primary: '#1976d2', secondary: '#42a5f5' },
            semantic: { success: '#4caf50', error: '#f44336', warning: '#ff9800', errorBg: '#ffebee' },
            interactive: { hover: '#f0f0f0' },
        },
        theme: 'light',
    }),
}));

describe('Sidebar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockUseAuth = vi.fn(() => ({
            isAuthenticated: false,
            currentUser: null,
            userRole: null,
            logout: mockLogout,
        }));
    });

    it('renders main navigation items', () => {
        renderWithProviders(<Sidebar />);

        expect(screen.getByText(/home/i)).toBeInTheDocument();
        expect(screen.getByText(/categories/i)).toBeInTheDocument();
        expect(screen.getByText(/requests/i)).toBeInTheDocument();
    });

    it('shows login and register buttons for unauthenticated users', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            currentUser: null,
            userRole: null,
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        expect(screen.getByText('sidebar.login')).toBeInTheDocument();
        expect(screen.getByText('sidebar.signUp')).toBeInTheDocument();
    });

    it('shows user profile and logout for authenticated users', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            currentUser: { id: 1, name: 'John', surname: 'Doe', username: 'johndoe' },
            userRole: 'user',
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        // Logout button only has an icon with aria-label
        expect(screen.getByLabelText('sidebar.logoutFromAccount')).toBeInTheDocument();
    });

    it('shows create request button for authenticated users', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            currentUser: { id: 1, name: 'John', surname: 'Doe', username: 'johndoe' },
            userRole: 'user',
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        expect(screen.getByText('sidebar.createRequest')).toBeInTheDocument();
    });

    it('shows admin panel link for admin users', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            currentUser: { id: 1, name: 'Admin', surname: 'User', username: 'admin' },
            userRole: 'admin',
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        expect(screen.getByText('sidebar.adminPanel')).toBeInTheDocument();
    });

    it('navigates to home when home is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Sidebar />);

        const homeButton = screen.getByText(/home/i);
        await user.click(homeButton);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('navigates to categories when categories is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Sidebar />);

        const categoriesButton = screen.getByText(/categories/i);
        await user.click(categoriesButton);

        expect(mockNavigate).toHaveBeenCalledWith('/categories');
    });

    it('navigates to requests when requests is clicked', async () => {
        const user = userEvent.setup();
        renderWithProviders(<Sidebar />);

        const requestsButton = screen.getByText(/requests/i);
        await user.click(requestsButton);

        expect(mockNavigate).toHaveBeenCalledWith('/requests');
    });

    it('calls logout when logout button is clicked', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            currentUser: { id: 1, name: 'John', surname: 'Doe', username: 'johndoe' },
            userRole: 'user',
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        const logoutButton = screen.getByLabelText('sidebar.logoutFromAccount');
        await user.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('displays user initials when no profile photo', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            currentUser: { id: 1, name: 'John', surname: 'Doe', username: 'johndoe' },
            userRole: 'user',
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('displays single initial for user with only first name', () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            currentUser: { id: 1, name: 'John', username: 'johndoe' },
            userRole: 'user',
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        expect(screen.getByText('J')).toBeInTheDocument();
    });


    it('navigates to profile when user profile is clicked', async () => {
        const user = userEvent.setup();
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            currentUser: { id: 1, name: 'John', surname: 'Doe', username: 'johndoe' },
            userRole: 'user',
            logout: mockLogout,
        });

        renderWithProviders(<Sidebar />);

        const profileButton = screen.getByText('John Doe');
        await user.click(profileButton);

        expect(mockNavigate).toHaveBeenCalledWith('/profile/1');
    });

});
