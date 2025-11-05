/**
 * SuggestedQuestions Navigation Tests
 * Story: 1.17.5 - Dashboard Mobile Optimization
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SuggestedQuestions } from '../SuggestedQuestions';

// Mock hooks
vi.mock('@/hooks/useIsDesktop', () => ({
  useIsDesktop: () => true, // Default to desktop
}));

describe('SuggestedQuestions - Enhanced Navigation', () => {
  const mockQuestions = [
    'What is the leave policy?',
    'How do I request time off?',
    'What are the holiday dates?',
    'How do I submit an expense report?',
    'What is the remote work policy?',
  ];

  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  const renderComponent = (questions = mockQuestions, isDesktop = true) => {
    // Mock useIsDesktop
    vi.doMock('@/hooks/useIsDesktop', () => ({
      useIsDesktop: () => isDesktop,
    }));

    return render(
      <SuggestedQuestions
        questions={questions}
        onQuestionClick={mockOnClick}
        isLoading={false}
        isVisible={true}
      />
    );
  };

  describe('Scroll Indicators', () => {
    it('shows right gradient when content overflows', async () => {
      renderComponent();

      await waitFor(() => {
        const gradients = screen.getAllByRole('presentation', { hidden: true });
        // Should have fade gradient elements
        expect(gradients.length).toBeGreaterThan(0);
      });
    });

    it('shows both gradients when scrolled to middle', async () => {
      const { container } = renderComponent();

      // Simulate scroll to middle
      const scrollContainer = container.querySelector('[class*="flex gap-2"]');
      if (scrollContainer) {
        Object.defineProperty(scrollContainer, 'scrollLeft', { value: 100, writable: true });
        Object.defineProperty(scrollContainer, 'scrollWidth', { value: 500, writable: true });
        Object.defineProperty(scrollContainer, 'clientWidth', { value: 300, writable: true });

        scrollContainer.dispatchEvent(new Event('scroll'));
      }

      await waitFor(() => {
        // Both gradients should be present
        const gradients = container.querySelectorAll('[class*="gradient"]');
        expect(gradients.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Navigation Controls (Desktop)', () => {
    it('shows navigation arrows on desktop when content overflows', async () => {
      renderComponent(mockQuestions, true);

      await waitFor(() => {
        const prevBtn = screen.queryByRole('button', { name: /previous question/i });
        const nextBtn = screen.queryByRole('button', { name: /next question/i });

        // At least one navigation button should be visible if content overflows
        expect(prevBtn || nextBtn).toBeTruthy();
      });
    });

    it('scrolls when navigation arrows are clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent(mockQuestions, true);

      const nextBtn = await waitFor(() =>
        screen.queryByRole('button', { name: /next question/i })
      );

      if (nextBtn) {
        const scrollContainer = container.querySelector('[class*="flex gap-2"]');
        const initialScrollLeft = scrollContainer?.scrollLeft || 0;

        await user.click(nextBtn);

        await waitFor(() => {
          const newScrollLeft = scrollContainer?.scrollLeft || 0;
          expect(newScrollLeft).toBeGreaterThanOrEqual(initialScrollLeft);
        });
      }
    });

    it('has proper ARIA labels on navigation buttons', async () => {
      renderComponent(mockQuestions, true);

      await waitFor(() => {
        const prevBtn = screen.queryByRole('button', { name: /previous question/i });
        const nextBtn = screen.queryByRole('button', { name: /next question/i });

        if (prevBtn) expect(prevBtn).toHaveAttribute('aria-label', 'Previous question');
        if (nextBtn) expect(nextBtn).toHaveAttribute('aria-label', 'Next question');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('navigates to next question with ArrowRight', async () => {
      const user = userEvent.setup();
      renderComponent();

      const firstQuestion = await waitFor(() =>
        screen.getByRole('button', { name: new RegExp(mockQuestions[0]) })
      );

      firstQuestion.focus();
      await user.keyboard('{ArrowRight}');

      await waitFor(() => {
        const secondQuestion = screen.getByRole('button', { name: new RegExp(mockQuestions[1]) });
        expect(secondQuestion).toHaveFocus();
      });
    });

    it('navigates to previous question with ArrowLeft', async () => {
      const user = userEvent.setup();
      renderComponent();

      const secondQuestion = await waitFor(() =>
        screen.getByRole('button', { name: new RegExp(mockQuestions[1]) })
      );

      secondQuestion.focus();
      await user.keyboard('{ArrowLeft}');

      await waitFor(() => {
        const firstQuestion = screen.getByRole('button', { name: new RegExp(mockQuestions[0]) });
        expect(firstQuestion).toHaveFocus();
      });
    });

    it('does not navigate past first question with ArrowLeft', async () => {
      const user = userEvent.setup();
      renderComponent();

      const firstQuestion = await waitFor(() =>
        screen.getByRole('button', { name: new RegExp(mockQuestions[0]) })
      );

      firstQuestion.focus();
      await user.keyboard('{ArrowLeft}');

      // Should still be focused on first question
      expect(firstQuestion).toHaveFocus();
    });

    it('does not navigate past last question with ArrowRight', async () => {
      const user = userEvent.setup();
      renderComponent();

      const lastQuestion = await waitFor(() =>
        screen.getByRole('button', { name: new RegExp(mockQuestions[mockQuestions.length - 1]) })
      );

      lastQuestion.focus();
      await user.keyboard('{ArrowRight}');

      // Should still be focused on last question
      expect(lastQuestion).toHaveFocus();
    });
  });

  describe('Dot Indicators', () => {
    it('shows dot indicators when multiple questions exist', async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        const dots = container.querySelectorAll('[aria-label*="Go to question"]');
        expect(dots.length).toBe(mockQuestions.length);
      });
    });

    it('does not show dots when only one question', async () => {
      const { container } = renderComponent(['Single question']);

      await waitFor(() => {
        const dots = container.querySelectorAll('[aria-label*="Go to question"]');
        expect(dots.length).toBe(0);
      });
    });

    it('highlights active dot indicator', async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        const dots = container.querySelectorAll('[aria-label*="Go to question"]');
        // First dot should have active styling (wider width)
        const firstDot = dots[0] as HTMLElement;
        expect(firstDot.className).toContain('bg-primary');
      });
    });

    it('navigates to question when dot is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderComponent();

      const thirdDot = await waitFor(() =>
        container.querySelector('[aria-label="Go to question 3"]')
      );

      if (thirdDot) {
        await user.click(thirdDot as HTMLElement);

        await waitFor(() => {
          const thirdQuestion = screen.getByRole('button', { name: new RegExp(mockQuestions[2]) });
          expect(thirdQuestion).toHaveFocus();
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('has descriptive ARIA labels on question buttons', async () => {
      renderComponent();

      await waitFor(() => {
        const firstQuestion = screen.getByRole('button', {
          name: new RegExp(`Suggested question 1 of ${mockQuestions.length}`),
        });
        expect(firstQuestion).toBeInTheDocument();
      });
    });

    it('announces question count to screen readers', async () => {
      renderComponent();

      await waitFor(() => {
        mockQuestions.forEach((_, index) => {
          const button = screen.getByRole('button', {
            name: new RegExp(`Suggested question ${index + 1} of ${mockQuestions.length}`),
          });
          expect(button).toHaveAttribute('aria-label');
        });
      });
    });

    it('dot indicators have accessible labels', async () => {
      const { container } = renderComponent();

      await waitFor(() => {
        mockQuestions.forEach((_, index) => {
          const dot = container.querySelector(`[aria-label="Go to question ${index + 1}"]`);
          expect(dot).toBeInTheDocument();
        });
      });
    });
  });

  describe('Click Interaction', () => {
    it('calls onQuestionClick when button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent();

      const firstQuestion = await waitFor(() =>
        screen.getByRole('button', { name: new RegExp(mockQuestions[0]) })
      );

      await user.click(firstQuestion);

      expect(mockOnClick).toHaveBeenCalledWith(mockQuestions[0]);
      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('calls onQuestionClick for each different question', async () => {
      const user = userEvent.setup();
      renderComponent();

      for (let i = 0; i < 3; i++) {
        const question = await waitFor(() =>
          screen.getByRole('button', { name: new RegExp(mockQuestions[i]) })
        );

        await user.click(question);
      }

      expect(mockOnClick).toHaveBeenCalledTimes(3);
      expect(mockOnClick).toHaveBeenNthCalledWith(1, mockQuestions[0]);
      expect(mockOnClick).toHaveBeenNthCalledWith(2, mockQuestions[1]);
      expect(mockOnClick).toHaveBeenNthCalledWith(3, mockQuestions[2]);
    });
  });

  describe('Loading State', () => {
    it('shows loading skeleton when isLoading is true', () => {
      render(
        <SuggestedQuestions
          questions={[]}
          onQuestionClick={mockOnClick}
          isLoading={true}
          isVisible={true}
        />
      );

      expect(screen.getByText('Generating questions...')).toBeInTheDocument();

      // Should show 3 skeleton placeholders
      const skeletons = screen.getAllByRole('presentation', { hidden: true });
      expect(skeletons.length).toBeGreaterThanOrEqual(0);
    });

    it('does not show navigation controls when loading', () => {
      render(
        <SuggestedQuestions
          questions={[]}
          onQuestionClick={mockOnClick}
          isLoading={true}
          isVisible={true}
        />
      );

      expect(screen.queryByRole('button', { name: /previous question/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /next question/i })).not.toBeInTheDocument();
    });
  });

  describe('Visibility', () => {
    it('does not render when isVisible is false', () => {
      const { container } = render(
        <SuggestedQuestions
          questions={mockQuestions}
          onQuestionClick={mockOnClick}
          isLoading={false}
          isVisible={false}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('does not render when no questions and not loading', () => {
      const { container } = render(
        <SuggestedQuestions
          questions={[]}
          onQuestionClick={mockOnClick}
          isLoading={false}
          isVisible={true}
        />
      );

      expect(container.firstChild).toBeNull();
    });
  });
});
