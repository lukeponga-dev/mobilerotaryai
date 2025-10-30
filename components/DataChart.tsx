import React, { useState } from 'react';
import { ChartData } from '../types';

const DataChart: React.FC<{ chartData: ChartData }> = ({ chartData }) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    const padding = { top: 40, right: 20, bottom: 50, left: 50 };
    const svgWidth = 500;
    const svgHeight = 300;
    const chartWidth = svgWidth - padding.left - padding.right;
    const chartHeight = svgHeight - padding.top - padding.bottom;

    const allData = chartData.datasets.flatMap(d => d.data);
    let yMax = allData.length > 0 ? Math.max(...allData) : 10;
    let yMin = allData.length > 0 ? Math.min(...allData) : 0;
    
    // Add buffer to top
    yMax = yMax + (yMax - yMin) * 0.1;
    // If all values are positive, start y-axis at 0
    if (yMin >= 0) {
        yMin = 0;
    } else {
    // If there are negative values, add buffer to bottom
        yMin = yMin - (yMax - yMin) * 0.1;
    }

    if (yMax === yMin) {
        yMax += 1;
    }

    const yRange = yMax - yMin === 0 ? 1 : yMax - yMin;

    const yScale = (value: number) => chartHeight - ((value - yMin) / yRange) * chartHeight;

    const yAxisLabels = [];
    const numTicks = 5;
    for (let i = 0; i <= numTicks; i++) {
        const value = yMin + (yRange / numTicks) * i;
        yAxisLabels.push({
            value: value.toLocaleString(undefined, { maximumFractionDigits: 2 }),
            y: padding.top + yScale(value),
        });
    }

    const renderBarChart = () => {
        const numBars = chartData.labels.length;
        const barGroupWidth = chartWidth / numBars;
        const barPadding = 0.2; // 20% padding
        const barWidth = barGroupWidth * (1 - barPadding);
        
        return (
            <g>
                {chartData.datasets[0].data.map((value, index) => {
                    const x = padding.left + index * barGroupWidth + (barGroupWidth * barPadding / 2);
                    const barY = value >= 0 ? padding.top + yScale(value) : padding.top + yScale(0);
                    const barHeight = Math.abs(yScale(0) - yScale(value));

                    return (
                        <g
                            key={index}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="cursor-pointer"
                        >
                            <rect
                                x={x}
                                y={barY}
                                width={barWidth}
                                height={barHeight}
                                className="fill-accent transition-all duration-200"
                                style={{ transformOrigin: `50% ${barY + barHeight}px`, transition: 'transform 0.1s ease-out', transform: hoveredIndex === index ? 'scale(1.05)' : 'none' }}
                            />
                            {hoveredIndex === index && (
                                <g transform={`translate(${x + barWidth / 2}, ${barY - 8})`} className="pointer-events-none">
                                    <rect x="-30" y="-22" width="60" height="20" rx="5" className="fill-dark-surface/80 dark:fill-light-surface/80" stroke="none" />
                                    <text y="-7" textAnchor="middle" className="text-xs font-bold fill-dark-text dark:fill-light-text">{value.toLocaleString()}{chartData.unit}</text>
                                </g>
                            )}
                        </g>
                    );
                })}
            </g>
        );
    };

    const renderLineChart = () => {
        const numPoints = chartData.labels.length;
        if (numPoints < 2) return null; // Cannot draw a line with less than 2 points

        const points = chartData.datasets[0].data.map((value, index) => ({
            x: padding.left + (index / (numPoints - 1)) * chartWidth,
            y: padding.top + yScale(value),
            value
        }));
        
        const pathData = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');

        return (
            <g>
                <path d={pathData} className="stroke-accent fill-none" strokeWidth="2" />
                {points.map((p, index) => (
                    <g key={index}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className="cursor-pointer"
                    >
                        {/* Invisible larger circle for easier hovering */}
                        <circle cx={p.x} cy={p.y} r="10" className="fill-transparent" />
                        <circle cx={p.x} cy={p.y} r={hoveredIndex === index ? 5 : 3} className="fill-accent transition-all duration-200 stroke-light-surface dark:stroke-dark-surface" strokeWidth="2" />
                        {hoveredIndex === index && (
                            <g transform={`translate(${p.x}, ${p.y - 12})`} className="pointer-events-none">
                                <rect x="-30" y="-22" width="60" height="20" rx="5" className="fill-dark-surface/80 dark:fill-light-surface/80" stroke="none" />
                                <text y="-7" textAnchor="middle" className="text-xs font-bold fill-dark-text dark:fill-light-text">{p.value.toLocaleString()}{chartData.unit}</text>
                            </g>
                        )}
                    </g>
                ))}
            </g>
        );
    };

    return (
        <div className="my-4 p-4 rounded-lg bg-light-panel-muted dark:bg-dark-panel-muted border border-light-border dark:border-dark-border">
            <h4 className="text-center font-semibold text-light-text dark:text-dark-text mb-2">{chartData.title}</h4>
             <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
                <title id="chart-title">{chartData.title}</title>
                {/* Y Axis Grid Lines & Labels */}
                <g>
                    {yAxisLabels.map(({ value, y }) => (
                        <g key={y} className="text-xs fill-light-muted dark:fill-dark-muted">
                            <line x1={padding.left} y1={y} x2={svgWidth - padding.right} y2={y} className="stroke-light-border/70 dark:stroke-dark-border/70" strokeDasharray="2,3"/>
                            <text x={padding.left - 8} y={y} textAnchor="end" alignmentBaseline="middle">
                                {value}
                            </text>
                        </g>
                    ))}
                    <text transform={`translate(${padding.left / 4 + 10}, ${padding.top + chartHeight/2}) rotate(-90)`} textAnchor="middle" className="text-xs fill-light-muted dark:fill-dark-muted">{chartData.unit}</text>
                </g>
                
                {/* X Axis Labels */}
                <g>
                    {chartData.labels.map((label, index) => {
                        const numItems = chartData.labels.length;
                        const x = chartData.type === 'bar' 
                            ? padding.left + index * (chartWidth / numItems) + (chartWidth / numItems / 2)
                            : padding.left + (index / (numItems > 1 ? numItems - 1 : 1)) * chartWidth;
                        
                        return (
                            <text
                                key={index}
                                x={x}
                                y={svgHeight - padding.bottom + 20}
                                textAnchor="middle"
                                className="text-xs fill-light-muted dark:fill-dark-muted"
                            >
                                {label}
                            </text>
                        )
                    })}
                </g>

                {/* Main chart content */}
                {chartData.type === 'bar' && renderBarChart()}
                {chartData.type === 'line' && renderLineChart()}
            </svg>
        </div>
    );
};

export default DataChart;