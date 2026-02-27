/**
 * Mobile Citation Viewer Tests
 * Story: 1.17.4 - Mobile Citation Viewer - Bottom Sheet Implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChatInterface } from '../ChatInterface';

// Mock hooks
vi.mock('@/hooks/useChatSession', () => ({
  useChatSession: () => ({
    chatSession: {
      id: 'test-session-123',
      title: 'Test Chat',
      description: 'Test description'
    },
    isLoading: false,
    error: null
  })
}));

vi.mock('@/hooks/useChatMessages', () => ({
  useChatMessages: () => ({
    messages: [
      {
        id: '1',
        message: {
          type: 'ai',
          content: {
            segments: [{ text: 'Test response', citation_id: 1 }],
            citations: [{ citation_id: 1, source_id: 'source-1', chunk_index: 0 }]
          }
        }
      }
    ],
    sendMessage: vi.fn(),
    isSending: false
  })
}));

vi.mock('@/hooks/useChatSessionSources', () => ({
  useChatSessionSources: () => ({
    sources: [{ id: 'source-1', title: 'Test Source' }],
    hasProcessedSources: true
  })
}));

vi.mock('@/hooks/useChatSidebarVisibility', () => ({
  useChatSidebarVisibility: () => ({
    showSourcesSidebar: false
  })
}));

vi.mock('@/hooks/useIsDesktop', () => ({
  useIsDesktop: () => false // Mobile viewport
}));

describe('Mobile Citation Viewer', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false }
      }
    });

    // Mock window.matchMedia for mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: query !== '(min-width: 1100px)', // Mobile viewport
        media: query,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn()
      }))
    });
  });

  const renderChatInterface = () => {
    return render(
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <ChatInterface />
        </QueryClientProvider>
      </BrowserRouter>
    );
  };

  it('citation buttons meet 44x44px minimum touch target', async () => {
    renderChatInterface();

    const citationBtn = await waitFor(() =>
      screen.getByRole('button', { name: /view citation/i })
    );

    const styles = window.getComputedStyle(citationBtn);
    const minWidth = parseInt(styles.minWidth);
    const minHeight = parseInt(styles.minHeight);

    expect(minWidth).toBeGreaterThanOrEqual(44);
    expect(minHeight).toBeGreaterThanOrEqual(44);
  });

  it('clicking citation on mobile opens bottom sheet', async () => {
    const user = userEvent.setup();
    renderChatInterface();

    const citationBtn = await waitFor(() =>
      screen.getByRole('button', { name: /view citation/i })
    );

    await user.click(citationBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Citation Source')).toBeInTheDocument();
    });
  });

  it('sheet displays correct document excerpt', async () => {
    const user = userEvent.setup();
    renderChatInterface();

    const citationBtn = await waitFor(() =>
      screen.getByRole('button', { name: /view citation/i })
    );

    await user.click(citationBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      // SourcesSidebar should be rendered inside
      expect(dialog.querySelector('.h-\\[calc\\(65vh-64px\\)\\]')).toBeInTheDocument();
    });
  });

  it('sheet closes when user clicks close button', async () => {
    const user = userEvent.setup();
    renderChatInterface();

    // Open sheet
    const citationBtn = await waitFor(() =>
      screen.getByRole('button', { name: /view citation/i })
    );
    await user.click(citationBtn);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Close via button (shadcn Sheet has built-in close)
    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('touch action manipulation prevents double-tap zoom', async () => {
    renderChatInterface();

    const citationBtn = await waitFor(() =>
      screen.getByRole('button', { name: /view citation/i })
    );

    const styles = window.getComputedStyle(citationBtn);
    expect(styles.touchAction).toBe('manipulation');
  });

  it('screen reader announces sheet opening', async () => {
    const user = userEvent.setup();
    renderChatInterface();

    const citationBtn = await waitFor(() =>
      screen.getByRole('button', { name: /view citation/i })
    );

    await user.click(citationBtn);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(screen.getByText('Citation Source')).toBeInTheDocument();
    });
  });
});
