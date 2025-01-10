// File: /src/components/UI/PaginationControls.tsx

import { useState, useEffect } from 'react';
import Button from './Button';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Show an optional "Go to page" input */
  showGoTo?: boolean;
  /** Add a simple fade in/out animation */
  smooth?: boolean;
}

/**
 * A reusable pagination component with optional direct “go to page” input
 * and an optional smooth fade on page transitions.
 */
export default function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  showGoTo = false,
  smooth = false,
}: PaginationControlsProps) {
  const [goPage, setGoPage] = useState(String(currentPage));
  const [fadeClass, setFadeClass] = useState(smooth ? 'opacity-0' : '');

  // If smooth === true, fade in whenever currentPage changes
  useEffect(() => {
    if (!smooth) return;
    // Hide first, then fade in
    setFadeClass('opacity-0');
    const t = setTimeout(() => {
      setFadeClass('opacity-100 transition-opacity duration-500');
    }, 0);
    return () => clearTimeout(t);
  }, [currentPage, smooth]);

  function handlePrev() {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }

  function handleNext() {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }

  function handleGoPage() {
    const num = parseInt(goPage, 10);
    if (!isNaN(num) && num >= 1 && num <= totalPages) {
      onPageChange(num);
    }
  }

  return (
    <div className={`flex items-center justify-center gap-4 mt-4 ${fadeClass}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrev}
        disabled={currentPage <= 1}
      >
        Previous
      </Button>

      <span className="text-sm text-gray-700">
        Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={handleNext}
        disabled={currentPage >= totalPages}
      >
        Next
      </Button>

      {showGoTo && (
        <div className="ml-4 flex items-center text-sm">
          <label className="mr-2 font-medium text-gray-600">Go to page:</label>
          <input
            type="number"
            className="w-16 border border-gray-300 rounded-md px-2 py-1"
            value={goPage}
            onChange={(e) => setGoPage(e.target.value)}
            min={1}
            max={totalPages}
          />
          <Button variant="outline" size="sm" className="ml-2" onClick={handleGoPage}>
            Go
          </Button>
        </div>
      )}
    </div>
  );
}
