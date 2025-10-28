import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Lightbulb, Loader2 } from 'lucide-react';

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
        // Question pills with horizontal scroll
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-2">
            {questions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => onQuestionClick(question)}
                className="whitespace-nowrap h-auto py-2 px-4 text-sm bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors"
              >
                {question}
              </Button>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default SuggestedQuestions;
