import React from 'react';
import { ContextData } from '../types';
import { InformationCircleIcon, XCircleIcon, ExclamationTriangleIcon, Cog6ToothIcon } from './icons';

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
        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2 uppercase tracking-wider">{title}</h3>
        <div className="space-y-2">
          {items.map((item, index) => {
             const { Icon, color } = getItemVisuals(item, type);
             return (
                <div key={index} className="flex items-start gap-3 bg-white dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
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
    <aside className="hidden md:block w-72 lg:w-80 xl:w-96 bg-slate-100/80 dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700/50 p-4 flex-shrink-0 overflow-y-auto transition-all duration-300 scroll-smooth">
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
          {renderList('Symptoms', context?.symptoms, 'symptom')}
          {renderList('Mentioned Parts', context?.parts, 'part')}
          {renderList('Suggested Actions', context?.actions, 'action')}
        </div>
      ) : !isLoading && (
        <p className="text-sm text-slate-400 dark:text-slate-500 italic">As you chat, a summary of your diagnosis will appear here.</p>
      )}
    </aside>
  );
};

export default ContextPanel;