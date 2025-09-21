import React, { forwardRef } from 'react';
import { ContentLine, ParsedContent } from '@/utils/contentParser';

interface EnhancedContentRendererProps {
  parsedContent: ParsedContent;
  highlightedContentRef?: React.RefObject<HTMLDivElement>;
}

const EnhancedContentRenderer = forwardRef<HTMLDivElement, EnhancedContentRendererProps>(
  ({ parsedContent, highlightedContentRef }, ref) => {
    const { lines, hasStructuredContent, tables } = parsedContent;

    const renderLine = (line: ContentLine, index: number) => {
      const isFirstHighlightedLine = line.isHighlighted && 
        (index === 0 || !lines[index - 1].isHighlighted);

      const baseClasses = `leading-relaxed transition-all duration-200 ease-in-out ${
        line.isHighlighted 
          ? 'border-l-4 border-purple-500 bg-purple-50 font-medium shadow-sm relative' 
          : 'hover:bg-gray-50 border-l-4 border-transparent'
      }`;

      // Get the line ref if this is the first highlighted line
      const lineRef = isFirstHighlightedLine ? highlightedContentRef : null;

      switch (line.type) {
        case 'header': {
          const HeaderTag = `h${Math.min(line.level || 1, 6)}` as keyof JSX.IntrinsicElements;
          const headerClasses = {
            1: 'text-3xl font-bold text-gray-900 mt-8 mb-6 pb-3 border-b border-gray-200',
            2: 'text-2xl font-bold text-gray-900 mt-6 mb-4 pb-2',
            3: 'text-xl font-semibold text-gray-800 mt-5 mb-3',
            4: 'text-lg font-semibold text-gray-800 mt-4 mb-2',
            5: 'text-base font-semibold text-gray-700 mt-3 mb-2',
            6: 'text-sm font-semibold text-gray-700 mt-2 mb-2'
          }[Math.min(line.level || 1, 6) as 1 | 2 | 3 | 4 | 5 | 6];

          return (
            <div
              key={index}
              ref={lineRef}
              className={`${baseClasses} px-4 py-3`}
            >
              <HeaderTag className={headerClasses}>
                {line.content.replace(/^#+\s+/, '')}
              </HeaderTag>
            </div>
          );
        }

        case 'table-header':
          return (
            <div
              key={index}
              ref={lineRef}
              className={`${baseClasses} px-0 py-2`}
            >
              <div className="mx-4 overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr className="border-b border-gray-200">
                      {line.content.split('|').slice(1, -1).map((cell, cellIndex) => (
                        <th 
                          key={cellIndex}
                          className="text-left py-3 px-4 font-semibold text-gray-900 text-sm border-r border-gray-200 last:border-r-0"
                        >
                          {cell.trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </table>
              </div>
            </div>
          );

        case 'table-row':
          return (
            <div
              key={index}
              ref={lineRef}
              className={`${baseClasses} px-0 py-0`}
            >
              <div className="mx-4 overflow-x-auto bg-white border-l border-r border-gray-200 last:border-b last:rounded-b-lg">
                <table className="min-w-full border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-25 transition-colors">
                      {line.content.split('|').slice(1, -1).map((cell, cellIndex) => (
                        <td 
                          key={cellIndex}
                          className="py-3 px-4 text-gray-700 text-sm border-r border-gray-100 last:border-r-0 align-top"
                        >
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );

        case 'table-separator':
          return (
            <div
              key={index}
              ref={lineRef}
              className={`${baseClasses} px-4 py-0`}
            >
              <div className="border-t border-gray-300 my-1"></div>
            </div>
          );

        case 'list-item': {
          const indent = ((line.level || 1) - 1) * 24;
          const listMarker = line.content.trim().match(/^(\d+\.|[-*+])/)?.[1] || '•';
          const listContent = line.content.trim().replace(/^(\d+\.|[-*+])\s+/, '');
          
          return (
            <div
              key={index}
              ref={lineRef}
              className={`${baseClasses} px-4 py-2`}
            >
              <div 
                className="flex items-start space-x-3"
                style={{ marginLeft: `${indent}px` }}
              >
                <span className="text-blue-600 font-semibold mt-0.5 min-w-[1.5rem] text-center">
                  {listMarker}
                </span>
                <span className="text-gray-800 flex-1 leading-relaxed">{listContent}</span>
              </div>
            </div>
          );
        }

        case 'empty':
          return (
            <div
              key={index}
              ref={lineRef}
              className={`${baseClasses} px-4 py-2 min-h-[1.25rem]`}
            >
              <span className="opacity-0">.</span>
            </div>
          );

        default:
          // Regular text with better typography
          return (
            <div
              key={index}
              ref={lineRef}
              className={`${baseClasses} px-4 py-2`}
            >
              <span className="text-gray-800 leading-relaxed">
                {line.content || '\u00A0'}
              </span>
            </div>
          );
      }
    };

    return (
      <div ref={ref} className="space-y-0">
        {hasStructuredContent ? (
          <div className="prose prose-gray max-w-none">
            {lines.map(renderLine)}
          </div>
        ) : (
          <div className="font-mono text-sm">
            {lines.map(renderLine)}
          </div>
        )}
      </div>
    );
  }
);

EnhancedContentRenderer.displayName = 'EnhancedContentRenderer';

export default EnhancedContentRenderer;