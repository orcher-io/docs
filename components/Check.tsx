import React from 'react';

/**
 * Check component for displaying green checkmarks in documentation.
 *
 * Usage:
 * - In MDX: `<Check /> Feature complete`
 * - With children: `<Check>Feature complete</Check>`
 *
 * This component provides a consistent, semantic way to display
 * success/completion indicators without the side effects of broad CSS rules.
 */
export const Check: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  if (children) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="text-green-500 font-bold leading-none" aria-label="complete">
          ✔
        </span>
        <span>{children}</span>
      </span>
    );
  }

  return (
    <span className="text-green-500 font-bold leading-none mr-1.5" aria-label="complete">
      ✔
    </span>
  );
};

export default Check;
