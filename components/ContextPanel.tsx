import React from 'react';
import { ContextData } from '../types';
import { InformationCircleIcon, XCircleIcon, ExclamationTriangleIcon, Cog6ToothIcon, BookmarkSquareIcon } from './icons';

interface ContextPanelProps {
  context?: ContextData;
  isLoading: boolean;
}

type ItemType = 'symptom' | 'action' | 'part';

const getItemVisuals = (text: string, type: ItemType): { Icon: React.FC<any>, color: string } => {
    const lowerText = text.toLowerCase();
    
    if (type === 'part') {
        return { Icon: Cog6ToothIcon, color: 'text-slate-500 dark:text-slate-400' };
    }

    if (/\b(stop|immediately|failure|fail|overheat|critical|danger|do not drive|catastrophic|severe damage)\b/.test(lowerText)) {
        return { Icon: XCircleIcon, color: 'text-red-500' };
    }
    if (/\b(check|inspect|replace|misfire|leak|caution|warning|poor|low|weak|fault|scan)\b/.test(lowerText)) {
        return { Icon: ExclamationTriangleIcon, color: 'text-orange-500' };
    }
    return { Icon: InformationCircleIcon, color: 'text-sky-500' };
};

const ContextPanel: React.FC<ContextPanelProps> = ({ context, isLoading }) => {
  const renderList = (title: string, items: string[] | undefined, type: ItemType) => {
    if (!items || items.length === 0) {
      return null;
    }
    return (
      <div>
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{title}</h3>
        <div className="space-y-3">
          {items.map((item, index) => {
             const { Icon, color } = getItemVisuals(item, type);
             return (
                <div key={index} className="flex items-start gap-3 bg-slate-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-shadow duration-300">
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${color}`} />
                    <p className="flex-1 text-sm text-slate-700 dark:text-slate-300">{item}</p>
                </div>
             );
          })}
        </div>
      </div>
    );
  };
  
  const hasContent = context && (context.symptoms.length > 0 || context.parts.length > 0 || context.actions.length > 0);

  return (
    <aside className="hidden md:block w-72 lg:w-80 xl:w-96 bg-slate-50 dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex-shrink-0 overflow-y-auto transition-all duration-300 scroll-smooth">
      <div className="flex items-center gap-3 mb-8">
        <BookmarkSquareIcon className="w-7 h-7 text-orange-500" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Diagnosis Summary</h2>
      </div>
      
      {isLoading && !hasContent && (
        <div className="space-y-6 animate-pulse">
            <div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mb-3"></div>
                <div className="h-16 bg-slate-300 dark:bg-slate-700 rounded-lg w-full"></div>
                <div className="h-16 bg-slate-300 dark:bg-slate-700 rounded-lg w-full mt-3"></div>
            </div>
            <div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-1/3 mt-6 mb-3"></div>
                <div className="h-16 bg-slate-300 dark:bg-slate-700 rounded-lg w-full"></div>
            </div>
        </div>
      )}

      {hasContent ? (
        <div className="space-y-8">
          {renderList('Symptoms', context?.symptoms, 'symptom')}
          {renderList('Mentioned Parts', context?.parts, 'part')}
          {renderList('Suggested Actions', context?.actions, 'action')}
        </div>
      ) : !isLoading && (
        <div className="text-center mt-10">
            <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700">
                <BookmarkSquareIcon className="w-8 h-8 text-slate-400 dark:text-slate-500"/>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-4 max-w-xs mx-auto">As you chat, a summary of your diagnosis will appear here.</p>
        </div>
      )}
    </aside>
  );
};

export default ContextPanel;