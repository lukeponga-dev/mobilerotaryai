import React from 'react';

const DataBox: React.FC<{ value: number; label: string; unit: string; statusColor?: string }> = ({
  value,
  label,
  unit,
  statusColor = 'text-light-text dark:text-dark-text'
}) => {
  return (
    <div className="flex flex-col items-center justify-center bg-light-surface dark:bg-dark-surface p-4 rounded-lg border border-light-border dark:border-dark-border shadow-lg aspect-square">
        <div className="flex-grow flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold transition-colors duration-300 ${statusColor}`}>{value.toFixed(1)}</span>
            <span className="text-sm font-medium text-light-muted dark:text-dark-muted">{unit}</span>
        </div>
      <span className="text-sm font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">{label}</span>
    </div>
  );
};

export default DataBox;
