import React from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  return (
    <span className="group relative inline-block">
      <span className="border-b-2 border-dotted border-accent/70 cursor-help">
        {children}
      </span>
      <div className="absolute bottom-full left-1/2 z-20 mb-2 w-64 -translate-x-1/2 transform rounded-lg bg-light-surface p-3 text-sm font-normal text-light-text shadow-xl opacity-0 transition-opacity group-hover:opacity-100 dark:bg-dark-surface dark:text-dark-text border border-light-border dark:border-dark-border pointer-events-none">
        {content}
        {/* Arrow pointing down */}
        <div 
          className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-x-8 border-t-8 border-x-transparent border-t-light-surface dark:border-t-dark-surface"
        />
      </div>
    </span>
  );
};

export default Tooltip;
