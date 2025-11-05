import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useIsDesktop';
import { cn } from '@/lib/utils';

interface SuggestedQuestionsProps {
  /**
   * Array of suggested question strings to display
   */
  questions: string[];

  /**
   * Callback when a question is clicked
   * @param question - The question text that was clicked
   */
  onQuestionClick: (question: string) => void;

  /**
   * Show loading skeleton when generating questions
   */
  isLoading?: boolean;

  /**
   * Control visibility (e.g., hide when user is typing)
   */
  isVisible?: boolean;
}

/**
 * SuggestedQuestions Component
 *
 * Displays AI-generated suggested questions below the chat input.
 * Questions are shown as clickable pill-style buttons in a horizontal scrollable area.
 *
 * Features:
 * - Horizontal scroll on desktop
 * - Responsive stacking on mobile
 * - Fade in/out animations
 * - Loading skeleton state
 * - Auto-hide when user types
 *
 * Design follows Human Habitat design system:
 * - Typography: Inter 14px, gray-700
 * - Pills: bg-gray-50, border-gray-200, rounded-lg
 * - Hover: bg-gray-100
 *
 * @example
 * ```tsx
 * <SuggestedQuestions
 *   questions={["What is the leave policy?", "How do I request time off?"]}
 *   onQuestionClick={(q) => handleSendMessage(q)}
 *   isLoading={false}
 *   isVisible={inputValue.length === 0}
 * />
 * ```
 */
export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onQuestionClick,
  isLoading = false,
  isVisible = true,
}) => {
  const isDesktop = useIsDesktop();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Scroll state
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  // Update scroll state
  const updateScrollState = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 5); // Small threshold for better UX
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 5);

    // Calculate active question based on scroll position
    const scrollCenter = el.scrollLeft + el.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Infinity;

    questionRefs.current.forEach((ref, index) => {
      if (ref) {
        const buttonCenter = ref.offsetLeft + ref.offsetWidth / 2;
        const distance = Math.abs(scrollCenter - buttonCenter);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      }
    });

    setActiveQuestionIndex(closestIndex);
  };

  // Initialize and listen to scroll events
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    // Initial check
    updateScrollState();

    // Add scroll listener
    el.addEventListener('scroll', updateScrollState);

    // Add resize observer to handle container size changes
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener('scroll', updateScrollState);
      resizeObserver.disconnect();
    };
  }, [questions]);

  // Scroll to specific question
  const scrollToQuestion = (index: number) => {
    const button = questionRefs.current[index];
    if (button) {
      button.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
      button.focus();
    }
  };

  // Scroll by one question width
  const scrollLeft = () => {
    const el = scrollContainerRef.current;
    if (!el || !questionRefs.current[0]) return;

    const buttonWidth = questionRefs.current[0].offsetWidth + 8; // +8 for gap
    el.scrollBy({ left: -buttonWidth, behavior: 'smooth' });
  };

  const scrollRight = () => {
    const el = scrollContainerRef.current;
    if (!el || !questionRefs.current[0]) return;

    const buttonWidth = questionRefs.current[0].offsetWidth + 8; // +8 for gap
    el.scrollBy({ left: buttonWidth, behavior: 'smooth' });
  };

  // Keyboard navigation handler
  const handleKeyNavigation = (e: React.KeyboardEvent, currentIndex: number) => {
    if (e.key === 'ArrowLeft' && currentIndex > 0) {
      e.preventDefault();
      scrollToQuestion(currentIndex - 1);
    }

    if (e.key === 'ArrowRight' && currentIndex < questions.length - 1) {
      e.preventDefault();
      scrollToQuestion(currentIndex + 1);
    }
  };

  // Don't render if not visible or no questions
  if (!isVisible || (!isLoading && questions.length === 0)) {
    return null;
  }

  return (
    <div className="mt-4 animate-in fade-in-50 duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
            <span className="text-sm text-gray-600">Generating questions...</span>
          </>
        ) : (
          <>
            <Lightbulb className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Suggested questions</span>
          </>
        )}
      </div>

      {/* Questions */}
      {isLoading ? (
        // Loading skeleton
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="relative">
          {/* Fade gradients */}
          {canScrollLeft && (
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
          )}
          {canScrollRight && (
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
          )}

          {/* Desktop navigation buttons */}
          {isDesktop && canScrollLeft && (
            <Button
              size="icon"
              variant="ghost"
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
              aria-label="Previous question"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}

          {isDesktop && canScrollRight && (
            <Button
              size="icon"
              variant="ghost"
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm shadow-md hover:bg-background"
              aria-label="Next question"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}

          {/* Scrollable questions */}
          <ScrollArea className="w-full">
            <div
              ref={scrollContainerRef}
              className="flex gap-2 pb-2 px-1"
              onScroll={updateScrollState}
            >
              {questions.map((question, index) => (
                <Button
                  key={index}
                  ref={(el) => (questionRefs.current[index] = el)}
                  variant="outline"
                  onClick={() => onQuestionClick(question)}
                  onKeyDown={(e) => handleKeyNavigation(e, index)}
                  className="whitespace-nowrap h-auto py-2 px-4 text-sm bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors"
                  aria-label={`Suggested question ${index + 1} of ${questions.length}: ${question}`}
                >
                  {question}
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Dot indicators */}
          {questions.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => scrollToQuestion(idx)}
                  className={cn(
                    'w-1.5 h-1.5 rounded-full transition-all duration-200',
                    activeQuestionIndex === idx
                      ? 'bg-primary w-4'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  )}
                  aria-label={`Go to question ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestedQuestions;
