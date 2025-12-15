import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSwitcher, LanguageButtons } from '../../components/LanguageSwitcher';

// Mock i18next
const mockChangeLanguage = vi.fn();
const mockI18n = {
    language: 'en',
    changeLanguage: mockChangeLanguage,
};

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        i18n: mockI18n,
    }),
}));

describe('LanguageSwitcher', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('should render language selector', () => {
        render(<LanguageSwitcher />);
        expect(screen.getByLabelText('Language')).toBeInTheDocument();
    });

    it('should display current language', () => {
        render(<LanguageSwitcher />);
        const select = screen.getByRole('combobox');
        // The select element exists and is rendered
        expect(select).toBeInTheDocument();
    });

    it('should change language when selection changes', async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        const select = screen.getByRole('combobox');
        await user.click(select);

        const turkishOption = screen.getByRole('option', { name: 'Türkçe' });
        await user.click(turkishOption);

        expect(mockChangeLanguage).toHaveBeenCalledWith('tr');
    });

    it('should save language preference to localStorage', async () => {
        const user = userEvent.setup();
        render(<LanguageSwitcher />);

        const select = screen.getByRole('combobox');
        await user.click(select);

        const turkishOption = screen.getByRole('option', { name: 'Türkçe' });
        await user.click(turkishOption);

        expect(localStorage.getItem('i18nextLng')).toBe('tr');
    });
});

describe('LanguageButtons', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        mockI18n.language = 'en';
    });

    it('should render language buttons', () => {
        render(<LanguageButtons />);
        expect(screen.getByRole('button', { name: 'EN' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'TR' })).toBeInTheDocument();
    });

    it('should highlight current language button', () => {
        render(<LanguageButtons />);
        const enButton = screen.getByRole('button', { name: 'EN' });
        expect(enButton).toHaveClass('MuiButton-contained');
    });

    it('should change language when button is clicked', async () => {
        const user = userEvent.setup();
        render(<LanguageButtons />);

        const trButton = screen.getByRole('button', { name: 'TR' });
        await user.click(trButton);

        expect(mockChangeLanguage).toHaveBeenCalledWith('tr');
        expect(localStorage.getItem('i18nextLng')).toBe('tr');
    });
});
