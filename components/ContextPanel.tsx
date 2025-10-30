import React from 'react';
import { ContextData } from '../types';
import { InformationCircleIcon, XCircleIcon, ExclamationTriangleIcon, Cog6ToothIcon, BookmarkSquareIcon } from './icons';

interface ContextPanelProps {
  context?: ContextData;
  isLoading: boolean;
}

type ItemType = 'symptom' | 'action' | 'part';

// REFACTORED: This function now returns a richer visual style object for color-coding.
type ItemVisuals = {
    Icon: React.FC<any>;
    iconColor: string;
    borderColor: string;
    bgColor: string;
};

const getItemVisuals = (text: string, type: ItemType): ItemVisuals => {
    const lowerText = text.toLowerCase();
    
    if (type === 'part') {
        return { 
            Icon: Cog6ToothIcon, 
            iconColor: 'text-info', 
            borderColor: 'border-info',
            bgColor: 'bg-info/10'
        };
    }

    if (/\b(stop|immediately|failure|fail|overheat|critical|danger|do not drive|catastrophic|severe damage)\b/.test(lowerText)) {
        return { 
            Icon: XCircleIcon, 
            iconColor: 'text-danger',
            borderColor: 'border-danger',
            bgColor: 'bg-danger/10'
        };
    }
    if (/\b(check|inspect|replace|misfire|leak|caution|warning|poor|low|weak|fault|scan)\b/.test(lowerText)) {
        return { 
            Icon: ExclamationTriangleIcon, 
            iconColor: 'text-warning',
            borderColor: 'border-warning',
            bgColor: 'bg-warning/10'
        };
    }
    return { 
        Icon: InformationCircleIcon, 
        iconColor: 'text-teal',
        borderColor: 'border-teal',
        bgColor: 'bg-teal/10'
    };
};

const ContextPanel: React.FC<ContextPanelProps> = ({ context, isLoading }) => {
  const renderList = (title: string, items: string[] | undefined, type: ItemType) => {
    if (!items || items.length === 0) {
      return null;
    }
    return (
      <div>
        <h3 className="text-sm font-semibold text-light-muted dark:text-dark-muted mb-3 uppercase tracking-wider">{title}</h3>
        <div className="space-y-2">
          {items.map((item, index) => {
             // REFACTORED: Destructure the new visual style object
             const { Icon, iconColor, borderColor, bgColor } = getItemVisuals(item, type);
             return (
                // REFACTORED: Apply new styling with colored border and background for better scannability
                <div key={index} className={`flex items-start gap-3 p-3 rounded-md border-l-4 transition-colors duration-200 ${borderColor} ${bgColor}`}>
                    <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
                    <p className="flex-1 text-sm text-light-text dark:text-dark-text">{item}</p>
                </div>
             );
          })}
        </div>
      </div>
    );
  };
  
  const hasContent = context && (context.symptoms.length > 0 || context.parts.length > 0 || context.actions.length > 0);

  const SkeletonList: React.FC<{ itemCount: number }> = ({ itemCount }) => (
    <div>
      <div className="h-4 bg-light-border dark:bg-dark-border rounded w-1/3 mb-3"></div>
      <div className="space-y-2">
        {[...Array(itemCount)].map((_, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-md bg-light-panel-muted/50 dark:bg-dark-panel-muted/50">
            <div className="w-5 h-5 bg-light-border dark:bg-dark-border rounded-full mt-0.5 flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-light-border dark:bg-dark-border rounded w-full"></div>
              <div className="h-3 bg-light-border dark:bg-dark-border rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <aside className="hidden md:block w-72 lg:w-80 xl:w-96 bg-light-surface dark:bg-dark-surface border-l border-light-border dark:border-dark-border p-6 flex-shrink-0 overflow-y-auto transition-all duration-300 scroll-smooth">
      <div className="flex items-center gap-3 mb-8">
        <BookmarkSquareIcon className="w-7 h-7 text-accent" />
        <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Diagnosis Summary</h2>
      </div>
      
      {isLoading && !hasContent && (
        <div className="space-y-8 animate-pulse">
          <SkeletonList itemCount={2} />
          <SkeletonList itemCount={1} />
          <SkeletonList itemCount={2} />
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
            <div className="mx-auto w-16 h-16 bg-light-panel-muted dark:bg-dark-panel-muted rounded-full flex items-center justify-center border-2 border-dashed border-light-border dark:border-dark-border">
                <BookmarkSquareIcon className="w-8 h-8 text-light-muted dark:text-dark-muted"/>
            </div>
            <p className="text-sm text-light-muted dark:text-dark-muted mt-4 max-w-xs mx-auto">As you chat, a summary of your diagnosis will appear here.</p>
        </div>
      )}
    </aside>
  );
};

export default ContextPanel;