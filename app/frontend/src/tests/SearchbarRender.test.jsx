import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Searchbar from '../components/Searchbar';

describe('Searchbar Rendering', () => {
  it('renders with default placeholder text', () => {
    render(<Searchbar />);
    
    const searchInput = screen.getByPlaceholderText('What do you need help with');
    expect(searchInput).toBeInTheDocument();
  });

  it('renders with custom placeholder text', () => {
    render(<Searchbar placeholder="Search requests" />);
    
    const searchInput = screen.getByPlaceholderText('Search requests');
    expect(searchInput).toBeInTheDocument();
  });

  it('displays the search icon button', () => {
    render(<Searchbar />);
    
    const searchButton = screen.getByRole('button', { name: 'search' });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton.querySelector('svg')).toBeInTheDocument();
  });

  it('does not show clear button when input is empty', () => {
    render(<Searchbar />);
    
    const clearButton = screen.queryByLabelText('clear');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('shows clear button when there is input', () => {
    render(<Searchbar defaultValue="test query" />);
    
    const clearButton = screen.getByLabelText('clear');
    expect(clearButton).toBeInTheDocument();
    expect(clearButton.querySelector('svg')).toBeInTheDocument();
  });

  it('applies autofocus when specified', () => {
    render(<Searchbar autoFocus={true} />);
    
    const searchInput = screen.getByPlaceholderText('What do you need help with');
    expect(searchInput).toHaveFocus();
  });

  it('does not apply autofocus by default', () => {
    render(<Searchbar />);
    
    const searchInput = screen.getByPlaceholderText('What do you need help with');
    expect(searchInput).not.toHaveFocus();
  });

  it('renders with default value when provided', () => {
    render(<Searchbar defaultValue="initial search" />);
    
    const searchInput = screen.getByDisplayValue('initial search');
    expect(searchInput).toBeInTheDocument();
  });

  it('applies custom styles when provided', () => {
    const customSx = { 
      backgroundColor: 'rgb(240, 240, 240)', 
      maxWidth: '500px' 
    };
    
    render(<Searchbar sx={customSx} />);
    
    // Find the Paper component (form)
    const searchForm = document.querySelector('form');
    expect(searchForm).toHaveStyle('background-color: rgb(240, 240, 240)');
    expect(searchForm).toHaveStyle('max-width: 500px');
  });

  it('has proper accessibility attributes', () => {
    render(<Searchbar />);
    
    const searchInput = screen.getByPlaceholderText('What do you need help with');
    expect(searchInput).toHaveAttribute('aria-label', 'search');
    
    const searchButton = screen.getByRole('button', { name: 'search' });
    expect(searchButton).toHaveAttribute('aria-label', 'search');
  });
});