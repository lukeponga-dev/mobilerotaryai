import React from 'react';
import { ContextData } from '../types';

interface ContextPanelProps {
  context?: ContextData;
  isLoading: boolean;
}

const ContextPanel: React.FC<ContextPanelProps> = ({ context, isLoading }) => {
  const renderList = (title: string, items: string[] | undefined) => {
    if (!items || items.length === 0) {
      return null;
    }
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">{title}</h3>
        <ul className="space-y-1.5">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-slate-700 dark:text-slate-300 bg-slate-200/50 dark:bg-slate-700/50 rounded px-2.5 py-1.5">
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  };
  
  const hasContent = context && (context.symptoms.length > 0 || context.parts.length > 0 || context.actions.length > 0);

  return (
    <aside className="hidden lg:block w-72 xl:w-80 2xl:w-96 bg-slate-100/80 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700/50 p-4 flex-shrink-0 overflow-y-auto transition-all duration-300">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Diagnosis Summary</h2>
      {isLoading && !hasContent && (
        <div className="space-y-6 animate-pulse">
            <div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-2"></div>
                <div className="h-3.5 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-3.5 bg-slate-300 dark:bg-slate-700 rounded w-2/3 mt-1.5"></div>
            </div>
            <div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mt-4 mb-2"></div>
                <div className="h-3.5 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
            </div>
        </div>
      )}
      {hasContent ? (
        <div className="space-y-6">
          {renderList('Symptoms', context?.symptoms)}
          {renderList('Mentioned Parts', context?.parts)}
          {renderList('Suggested Actions', context?.actions)}
        </div>
      ) : !isLoading && (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">As you chat, a summary of your diagnosis will appear here.</p>
      )}
    </aside>
  );
};

export default ContextPanel;