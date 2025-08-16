/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '@/components/theme-toggle';

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

// Basic smoke test to ensure component renders the accessible toggle label

describe('ThemeToggle', () => {
  it('renders toggle button', () => {
    render(<ThemeToggle />);
    const btn = screen.getByRole('button');
    expect(btn).toBeInTheDocument();
  });
});
