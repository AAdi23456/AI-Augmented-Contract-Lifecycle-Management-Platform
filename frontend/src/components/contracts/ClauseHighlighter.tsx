import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";

interface Clause {
  id: string;
  type: string;
  text: string;
  riskScore: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface ClauseHighlighterProps {
  contractText: string;
  clauses: Clause[];
  onClauseClick?: (clause: Clause) => void;
}

export function ClauseHighlighter({ contractText, clauses, onClauseClick }: ClauseHighlighterProps) {
  const [highlightedText, setHighlightedText] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    if (!contractText || !clauses.length) {
      setHighlightedText([<span key="original">{contractText}</span>]);
      return;
    }

    // Sort clauses by their position in the text (to handle overlapping clauses)
    const sortedClauses = [...clauses].sort((a, b) => {
      const posA = contractText.indexOf(a.text);
      const posB = contractText.indexOf(b.text);
      return posA - posB;
    });

    let lastIndex = 0;
    const segments: React.ReactNode[] = [];

    // Process each clause and create highlighted segments
    sortedClauses.forEach((clause, index) => {
      const clauseIndex = contractText.indexOf(clause.text, lastIndex);
      
      // If clause text is not found, skip it
      if (clauseIndex === -1) return;

      // Add non-highlighted text before this clause
      if (clauseIndex > lastIndex) {
        segments.push(
          <span key={`text-${lastIndex}-${clauseIndex}`}>
            {contractText.substring(lastIndex, clauseIndex)}
          </span>
        );
      }

      // Add highlighted clause
      const highlightColor = getRiskHighlightColor(clause.riskScore);
      segments.push(
        <span 
          key={`clause-${index}`}
          className={`cursor-pointer ${highlightColor} hover:opacity-80 transition-opacity`}
          onClick={() => onClauseClick && onClauseClick(clause)}
          title={`${clause.type} (${clause.riskScore})`}
        >
          {clause.text}
        </span>
      );

      lastIndex = clauseIndex + clause.text.length;
    });

    // Add any remaining text after the last clause
    if (lastIndex < contractText.length) {
      segments.push(
        <span key={`text-${lastIndex}-end`}>
          {contractText.substring(lastIndex)}
        </span>
      );
    }

    setHighlightedText(segments);
  }, [contractText, clauses, onClauseClick]);

  const getRiskHighlightColor = (riskScore: string) => {
    switch (riskScore) {
      case 'HIGH':
        return 'bg-red-100 border-b-2 border-red-500';
      case 'MEDIUM':
        return 'bg-yellow-100 border-b-2 border-yellow-500';
      case 'LOW':
        return 'bg-green-100 border-b-2 border-green-500';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <div className="text-sm font-medium">Risk Legend:</div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full"></span>
          <span className="text-sm">High</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full"></span>
          <span className="text-sm">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="text-sm">Low</span>
        </div>
      </div>
      
      <div className="p-4 border rounded-md bg-white whitespace-pre-wrap">
        {highlightedText}
      </div>
    </div>
  );
} 