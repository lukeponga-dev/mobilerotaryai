import React from 'react';
import { ContextData } from '@/types/diagnosis';
import { XIcon } from '@/components/icons';

interface DiagnosisSummaryProps {
  context?: ContextData;
  isLoading: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const DiagnosisSummary: React.FC<DiagnosisSummaryProps> = ({ context, isLoading, isOpen, onClose }) => {
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

  const panelContent = (
    <>
      {isLoading && !hasContent ? (
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
      ) : hasContent ? (
        <div className="space-y-6">
          {renderList('Symptoms', context?.symptoms)}
          {renderList('Mentioned Parts', context?.parts)}
          {renderList('Suggested Actions', context?.actions)}
        </div>
      ) : (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">As you chat, a summary of your diagnosis will appear here.</p>
      )}
    </>
  );

  return (
    <>
      {/* Static panel for large screens */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 2xl:w-96 bg-slate-100/80 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700/50 p-4 flex-shrink-0">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex-shrink-0">Diagnosis Summary</h2>
        <div className="overflow-y-auto pr-2 -mr-2">
          {panelContent}
        </div>
      </aside>

      {/* Slide-over panel for smaller screens */}
      <div className={`lg:hidden fixed inset-0 z-40 ${isOpen ? '' : 'pointer-events-none'}`} role="dialog" aria-modal="true">
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
          aria-hidden="true"
        />
        {/* Panel */}
        <div className={`absolute top-0 right-0 h-full w-full max-w-sm bg-slate-100 dark:bg-slate-800 transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700/50 flex-shrink-0">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white" id="context-panel-title">Diagnosis Summary</h2>
                <button onClick={onClose} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white" aria-label="Close summary panel">
                    <XIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="overflow-y-auto p-4">
                {panelContent}
            </div>
        </div>
      </div>
    </>
  );
};

export default DiagnosisSummary;
