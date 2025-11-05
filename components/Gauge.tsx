import React from 'react';

const Gauge: React.FC<{ 
    value: number; 
    label: string; 
    unit: string; 
    min?: number; 
    max?: number; 
    redline?: number;
    warning?: number;
    lowWarning?: number;
}> = ({
  value,
  label,
  unit,
  min = 0,
  max = 9000,
  redline,
  warning,
  lowWarning,
}) => {
  const S = 220; // Size
  const R = 90; // Radius
  const CX = S / 2;
  const CY = S / 2;
  const strokeWidth = 20;

  const totalAngle = 270;
  const startAngle = -225;

  const valueToAngle = (val: number) => {
    const percentage = (val - min) / (max - min);
    return startAngle + percentage * totalAngle;
  };

  const angleToCoords = (angle: number, radius: number = R) => {
    const rad = (angle * Math.PI) / 180;
    return {
      x: CX + radius * Math.cos(rad),
      y: CY + radius * Math.sin(rad),
    };
  };
  
  const arc = (start: number, end: number) => {
    const startPoint = angleToCoords(start);
    const endPoint = angleToCoords(end);
    const largeArcFlag = end - start <= 180 ? '0' : '1';
    return `M ${startPoint.x} ${startPoint.y} A ${R} ${R} 0 ${largeArcFlag} 1 ${endPoint.x} ${endPoint.y}`;
  };

  const clampedValue = Math.max(min, Math.min(value, max));
  const needleAngle = valueToAngle(clampedValue);
  
  let valueArcClass = 'stroke-accent';
  let valueTextClass = 'text-light-text dark:text-dark-text';

  if (redline && clampedValue >= redline) {
    valueArcClass = 'stroke-danger';
    valueTextClass = 'text-danger';
  } else if (warning && clampedValue >= warning) {
    valueArcClass = 'stroke-warning';
    valueTextClass = 'text-warning';
  } else if (lowWarning && clampedValue <= lowWarning) {
    valueArcClass = 'stroke-warning';
    valueTextClass = 'text-warning';
  }
  
  const redlineStartAngle = redline ? valueToAngle(redline) : null;
  const displayValue = label === 'Voltage' ? value.toFixed(1) : Math.round(value);

  return (
    <div className="relative flex flex-col items-center justify-center bg-light-surface dark:bg-dark-surface p-4 rounded-lg border border-light-border dark:border-dark-border shadow-lg aspect-square">
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full h-auto">
        {/* Background Arc */}
        <path d={arc(startAngle, startAngle + totalAngle)} fill="none" className="stroke-light-panel-muted dark:stroke-dark-panel-muted" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Redline Arc */}
        {redlineStartAngle && <path d={arc(redlineStartAngle, startAngle + totalAngle)} fill="none" className="stroke-danger/40" strokeWidth={strokeWidth} strokeLinecap="round" />}
        
        {/* Value Arc */}
        <path d={arc(startAngle, needleAngle)} fill="none" className={valueArcClass} strokeWidth={strokeWidth} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease-out, stroke 0.3s ease-in-out' }} />
        
        {/* Needle */}
        <g transform={`rotate(${needleAngle} ${CX} ${CY})`} style={{ transition: 'transform 0.5s ease-out' }}>
          <path d={`M ${CX} ${CY + 10} L ${CX} ${CY - R + 5}`} className="stroke-light-text dark:stroke-dark-text" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx={CX} cy={CY} r="6" className="fill-light-text dark:fill-dark-text" />
      </svg>
      <div className="absolute flex flex-col items-center text-center -translate-y-2">
        <span className={`text-4xl font-bold transition-colors duration-300 ${valueTextClass}`}>{displayValue}</span>
        <span className="text-sm font-medium text-light-muted dark:text-dark-muted">{unit}</span>
      </div>
      <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">{label}</span>
    </div>
  );
};

export default Gauge;
