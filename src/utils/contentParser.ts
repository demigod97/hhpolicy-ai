/**
 * Content parsing utilities for enhanced document rendering
 */

export interface ContentLine {
  lineNumber: number;
  content: string;
  type: 'text' | 'header' | 'table-header' | 'table-row' | 'table-separator' | 'list-item' | 'empty';
  level?: number; // for headers (1-6) or list nesting
  isHighlighted?: boolean;
}

export interface ParsedContent {
  lines: ContentLine[];
  hasStructuredContent: boolean;
  tables: Array<{
    startLine: number;
    endLine: number;
    headers: string[];
    rows: string[][];
  }>;
}

/**
 * Parse content and detect structure (headers, tables, lists)
 */
export function parseContentStructure(content: string, highlightStart?: number, highlightEnd?: number): ParsedContent {
  const lines = content.split('\n');
  const parsedLines: ContentLine[] = [];
  const tables: ParsedContent['tables'] = [];
  let hasStructuredContent = false;
  let currentTableStart: number | null = null;
  let currentTableHeaders: string[] = [];
  let currentTableRows: string[][] = [];

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmed = line.trim();
    const isHighlighted = highlightStart && highlightEnd 
      ? lineNumber >= highlightStart && lineNumber <= highlightEnd 
      : false;

    // Empty line
    if (!trimmed) {
      // If we were building a table, finalize it
      if (currentTableStart !== null) {
        tables.push({
          startLine: currentTableStart,
          endLine: lineNumber - 1,
          headers: currentTableHeaders,
          rows: currentTableRows
        });
        currentTableStart = null;
        currentTableHeaders = [];
        currentTableRows = [];
      }
      
      parsedLines.push({
        lineNumber,
        content: line,
        type: 'empty',
        isHighlighted
      });
      return;
    }

    // Detect headers (markdown style)
    const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      hasStructuredContent = true;
      parsedLines.push({
        lineNumber,
        content: line,
        type: 'header',
        level: headerMatch[1].length,
        isHighlighted
      });
      return;
    }

    // Detect table rows (markdown style with pipes)
    const tableMatch = trimmed.match(/^\|(.+)\|$/);
    if (tableMatch) {
      hasStructuredContent = true;
      const cells = tableMatch[1].split('|').map(cell => cell.trim());
      
      // Check if this is a separator row
      const isSeparator = cells.every(cell => /^:?-+:?$/.test(cell));
      
      if (isSeparator) {
        parsedLines.push({
          lineNumber,
          content: line,
          type: 'table-separator',
          isHighlighted
        });
      } else {
        // If this is the first row or after a separator, it's headers
        const isHeaderRow = currentTableStart === null || 
          (parsedLines.length > 0 && parsedLines[parsedLines.length - 1].type === 'table-separator');
        
        if (currentTableStart === null) {
          currentTableStart = lineNumber;
        }
        
        if (isHeaderRow && currentTableHeaders.length === 0) {
          currentTableHeaders = cells;
          parsedLines.push({
            lineNumber,
            content: line,
            type: 'table-header',
            isHighlighted
          });
        } else {
          currentTableRows.push(cells);
          parsedLines.push({
            lineNumber,
            content: line,
            type: 'table-row',
            isHighlighted
          });
        }
      }
      return;
    }

    // Detect list items
    const listMatch = trimmed.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      hasStructuredContent = true;
      const indentLevel = Math.floor(listMatch[1].length / 2) + 1;
      parsedLines.push({
        lineNumber,
        content: line,
        type: 'list-item',
        level: indentLevel,
        isHighlighted
      });
      return;
    }

    // Regular text
    parsedLines.push({
      lineNumber,
      content: line,
      type: 'text',
      isHighlighted
    });
  });

  // Finalize any remaining table
  if (currentTableStart !== null) {
    tables.push({
      startLine: currentTableStart,
      endLine: lines.length,
      headers: currentTableHeaders,
      rows: currentTableRows
    });
  }

  return {
    lines: parsedLines,
    hasStructuredContent,
    tables
  };
}

/**
 * Check if content appears to be policy/document content vs code
 */
export function detectContentType(content: string): 'document' | 'code' | 'mixed' {
  const lines = content.split('\n');
  let documentIndicators = 0;
  let codeIndicators = 0;

  lines.forEach(line => {
    const trimmed = line.trim();
    
    // Document indicators
    if (trimmed.match(/^#+\s/)) documentIndicators++; // Headers
    if (trimmed.match(/^\|.*\|$/)) documentIndicators++; // Tables
    if (trimmed.match(/^[-*+]\s/)) documentIndicators++; // Lists
    if (trimmed.match(/^(Policy|Administrative|Executive|Summary|Eligibility|Compliance|Guidelines)/i)) documentIndicators += 2;
    
    // Code indicators
    if (trimmed.match(/^(import|export|function|class|const|let|var)\s/)) codeIndicators++;
    if (trimmed.match(/[{}[\];]/)) codeIndicators++;
    if (trimmed.match(/^\/\/|^\/\*|\*\/$/)) codeIndicators++;
  });

  if (documentIndicators > codeIndicators * 2) return 'document';
  if (codeIndicators > documentIndicators * 2) return 'code';
  return 'mixed';
}