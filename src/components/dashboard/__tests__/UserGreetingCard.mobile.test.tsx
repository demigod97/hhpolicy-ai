/**
 * Mobile UserGreetingCard Tests
 * Story: 1.17.5 - Dashboard Mobile Optimization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserGreetingCard } from '../UserGreetingCard';

// Mock hooks
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'test@example.com' },
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useUserRole', () => ({
  useUserRole: () => ({ userRole: 'system_owner' }),
}));

vi.mock('@/hooks/useDocumentStats', () => ({
  useDocumentStats: () => ({
    data: { total: 42, recent: 5, uploaded: 12, processing: 0 },
    isLoading: false,
  }),
}));

vi.mock('@/hooks/useChatSession', () => ({
  useCreateChatSession: () => ({ mutateAsync: vi.fn() }),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

describe('UserGreetingCard - Mobile Optimization', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });

    // Clear localStorage
    localStorage.clear();
  });

  const renderCard = (isDesktop = false) => {
    // Mock useIsDesktop
    vi.doMock('@/hooks/useIsDesktop', () => ({
      useIsDesktop: () => isDesktop,
    }));

    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: isDesktop ? query === '(min-width: 1100px)' : query !== '(min-width: 1100px)',
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <UserGreetingCard />
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  describe('Mobile Viewport', () => {
    it('defaults to collapsed state on mobile', async () => {
      renderCard(false);

      // Toggle button should be visible
      const toggleBtn = await waitFor(() =>
        screen.getByRole('button', { name: /view statistics/i })
      );
      expect(toggleBtn).toBeInTheDocument();

      // Stats should not be visible initially (collapsed)
      const statsGrid = screen.queryByText('Total Documents');
      expect(statsGrid).not.toBeInTheDocument();
    });

    it('toggle button expands and collapses card', async () => {
      const user = userEvent.setup();
      renderCard(false);

      const toggleBtn = await waitFor(() =>
        screen.getByRole('button', { name: /view statistics/i })
      );

      // Expand
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByText('Total Documents')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument(); // Total count
      });

      // Button text should change
      expect(screen.getByRole('button', { name: /hide statistics/i })).toBeInTheDocument();

      // Collapse
      const hideBtn = screen.getByRole('button', { name: /hide statistics/i });
      await user.click(hideBtn);

      await waitFor(() => {
        expect(screen.queryByText('Total Documents')).not.toBeInTheDocument();
      });
    });

    it('persists collapse state in localStorage', async () => {
      const user = userEvent.setup();
      renderCard(false);

      const toggleBtn = await waitFor(() =>
        screen.getByRole('button', { name: /view statistics/i })
      );

      // Expand
      await user.click(toggleBtn);

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-greeting-expanded')).toBe('true');
      });

      // Collapse
      const hideBtn = screen.getByRole('button', { name: /hide statistics/i });
      await user.click(hideBtn);

      await waitFor(() => {
        expect(localStorage.getItem('dashboard-greeting-expanded')).toBe('false');
      });
    });

    it('touch target meets 44x44px minimum', async () => {
      renderCard(false);

      const toggleBtn = await waitFor(() =>
        screen.getByRole('button', { name: /view statistics/i })
      );

      const styles = window.getComputedStyle(toggleBtn);
      const minWidth = parseInt(styles.minWidth);
      const minHeight = parseInt(styles.minHeight);

      expect(minWidth).toBeGreaterThanOrEqual(44);
      expect(minHeight).toBeGreaterThanOrEqual(44);
    });

    it('has touch-action manipulation to prevent double-tap zoom', async () => {
      renderCard(false);

      const toggleBtn = await waitFor(() =>
        screen.getByRole('button', { name: /view statistics/i })
      );

      expect(toggleBtn).toHaveStyle({ touchAction: 'manipulation' });
    });

    it('has proper ARIA attributes', async () => {
      renderCard(false);

      const toggleBtn = await waitFor(() =>
        screen.getByRole('button', { name: /view statistics/i })
      );

      expect(toggleBtn).toHaveAttribute('aria-expanded', 'false');
      expect(toggleBtn).toHaveAttribute('aria-controls', 'stats-section');
    });
  });

  describe('Desktop Viewport', () => {
    it('always shows expanded card on desktop', async () => {
      renderCard(true);

      // Stats should be visible immediately
      await waitFor(() => {
        expect(screen.getByText('Total Documents')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
      });

      // Toggle button should NOT be visible
      const toggleBtn = screen.queryByRole('button', { name: /view statistics/i });
      expect(toggleBtn).not.toBeInTheDocument();
    });

    it('quick actions visible on desktop', async () => {
      renderCard(true);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /new chat/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /upload/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /manage/i })).toBeInTheDocument();
      });
    });
  });

  describe('Content Display', () => {
    it('displays user greeting and role badge', async () => {
      renderCard(false);

      await waitFor(() => {
        expect(screen.getByText(/good (morning|afternoon|evening), test/i)).toBeInTheDocument();
        expect(screen.getByText('test@example.com')).toBeInTheDocument();
      });
    });

    it('displays all statistics when expanded', async () => {
      const user = userEvent.setup();
      renderCard(false);

      const toggleBtn = await waitFor(() =>
        screen.getByRole('button', { name: /view statistics/i })
      );

      await user.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByText('Total Documents')).toBeInTheDocument();
        expect(screen.getByText('42')).toBeInTheDocument();
        expect(screen.getByText('Recent')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('Your Uploads')).toBeInTheDocument();
        expect(screen.getByText('12')).toBeInTheDocument();
      });
    });
  });
});
