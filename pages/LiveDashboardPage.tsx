import React, { useState, useEffect, useRef } from 'react';
import Button from '../components/Button';
import { BoltIcon, XCircleIcon } from '../components/icons';

// --- Reusable Components ---

const Gauge: React.FC<{ value: number; label: string; unit: string; min?: number; max?: number; redline?: number }> = ({
  value,
  label,
  unit,
  min = 0,
  max = 9000,
  redline = 7500,
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

  const needleAngle = valueToAngle(Math.min(value, max));
  const redlineStartAngle = valueToAngle(redline);

  return (
    <div className="relative flex flex-col items-center justify-center bg-light-surface dark:bg-dark-surface p-4 rounded-lg border border-light-border dark:border-dark-border shadow-lg aspect-square">
      <svg viewBox={`0 0 ${S} ${S}`} className="w-full h-auto">
        {/* Background Arc */}
        <path d={arc(startAngle, startAngle + totalAngle)} fill="none" className="stroke-light-panel-muted dark:stroke-dark-panel-muted" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Value Arc */}
        <path d={arc(startAngle, needleAngle)} fill="none" className="stroke-accent" strokeWidth={strokeWidth} strokeLinecap="round" style={{ transition: 'stroke-dasharray 0.5s ease-out' }} />

        {/* Redline Arc */}
        <path d={arc(redlineStartAngle, startAngle + totalAngle)} fill="none" className="stroke-danger" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Needle */}
        <g transform={`rotate(${needleAngle} ${CX} ${CY})`} style={{ transition: 'transform 0.5s ease-out' }}>
          <path d={`M ${CX} ${CY - R + 5} L ${CX} ${CY - R + strokeWidth + 10}`} className="stroke-light-text dark:stroke-dark-text" strokeWidth="3" strokeLinecap="round" />
        </g>
        <circle cx={CX} cy={CY} r="8" className="fill-light-text dark:fill-dark-text" />
      </svg>
      <div className="absolute flex flex-col items-center text-center -translate-y-2">
        <span className="text-4xl font-bold text-light-text dark:text-dark-text">{Math.round(value)}</span>
        <span className="text-sm font-medium text-light-muted dark:text-dark-muted">{unit}</span>
      </div>
      <span className="mt-2 text-sm font-semibold uppercase tracking-wider text-light-muted dark:text-dark-muted">{label}</span>
    </div>
  );
};

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

// --- Page Component ---

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface VehicleData {
    rpm: number;
    coolantTemp: number; // in Celsius
    oilPressure: number; // in PSI
    throttlePos: number; // in %
    stft: number; // Short Term Fuel Trim in %
    voltage: number;
}

const initialData: VehicleData = {
    rpm: 0,
    coolantTemp: 20,
    oilPressure: 0,
    throttlePos: 0,
    stft: 0,
    voltage: 12.5
};

const LiveDashboardPage: React.FC = () => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [data, setData] = useState<VehicleData>(initialData);
    const dataIntervalRef = useRef<number | null>(null);

    const simulateData = () => {
        setData(prev => {
            // Simulate idle vs driving
            const isIdle = Math.random() > 0.3;
            const newRpm = isIdle ? 850 + (Math.random() - 0.5) * 50 : 2500 + Math.random() * 2000;
            const newThrottle = isIdle ? 2 + Math.random() * 2 : 15 + Math.random() * 60;
            
            // Coolant slowly warms up to 90C
            let newCoolant = prev.coolantTemp < 90 ? prev.coolantTemp + 0.5 : 90 + (Math.random() - 0.5) * 5;
            newCoolant = Math.min(newCoolant, 105); // Don't let it go too high in normal sim

            return {
                rpm: newRpm,
                coolantTemp: newCoolant,
                oilPressure: 15 + (newRpm/1000) * 10 + (Math.random() - 0.5) * 5,
                throttlePos: newThrottle,
                stft: (Math.random() - 0.5) * 5, // Fluctuate around 0
                voltage: 13.8 + (Math.random() - 0.5) * 0.4
            };
        });
    };
    
    useEffect(() => {
        if (status === 'connected' && !dataIntervalRef.current) {
            dataIntervalRef.current = window.setInterval(simulateData, 750);
        } else if (status !== 'connected' && dataIntervalRef.current) {
            clearInterval(dataIntervalRef.current);
            dataIntervalRef.current = null;
        }

        return () => {
            if (dataIntervalRef.current) {
                clearInterval(dataIntervalRef.current);
            }
        };
    }, [status]);

    const handleConnect = () => {
        setStatus('connecting');
        setTimeout(() => {
            if (Math.random() > 0.1) { // 90% success rate
                setStatus('connected');
            } else {
                setStatus('error');
            }
        }, 2000);
    };

    const handleDisconnect = () => {
        setStatus('disconnected');
        setData(initialData);
    };
    
    const getCoolantStatusColor = () => {
        if (data.coolantTemp > 100) return 'text-danger';
        if (data.coolantTemp > 95) return 'text-warning';
        return 'text-light-text dark:text-dark-text';
    };

    const renderContent = () => {
        if (status === 'disconnected' || status === 'error') {
            return (
                <div className="text-center">
                    <BoltIcon className="w-24 h-24 mx-auto text-light-muted dark:text-dark-muted mb-4" />
                    <h2 className="text-2xl font-bold mb-2">OBD-2 Live Data</h2>
                    <p className="text-light-muted dark:text-dark-muted mb-6">Connect to a simulated OBD-2 adapter to view real-time engine data.</p>
                    {status === 'error' && (
                        <p className="text-danger bg-danger/10 p-3 rounded-md mb-6">
                            Failed to connect. Please check your adapter and try again.
                        </p>
                    )}
                    <Button onClick={handleConnect} size="lg" variant="primary" className="gap-2">
                        <BoltIcon className="w-5 h-5" />
                        Connect
                    </Button>
                </div>
            );
        }

        if (status === 'connecting') {
            return (
                <div className="text-center">
                    <BoltIcon className="w-24 h-24 mx-auto text-accent animate-pulse mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
                    <p className="text-light-muted dark:text-dark-muted">Attempting to establish connection with OBD-2 adapter.</p>
                </div>
            );
        }

        return (
            <div>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    <div className="col-span-2 md:col-span-3 lg:col-span-2 row-span-2">
                        <Gauge value={data.rpm} label="Engine Speed" unit="RPM" max={9000} redline={8500} />
                    </div>
                    <DataBox value={data.coolantTemp} label="Coolant Temp" unit="°C" statusColor={getCoolantStatusColor()} />
                    <DataBox value={data.oilPressure} label="Oil Pressure" unit="PSI" />
                    <DataBox value={data.throttlePos} label="Throttle" unit="%" />
                    <DataBox value={data.voltage} label="Voltage" unit="V" />
                    <DataBox value={data.stft} label="STFT" unit="%" />
                    <div className="col-span-2 md:col-span-1 flex items-center justify-center p-4">
                        <Button onClick={handleDisconnect} variant="destructive" className="w-full gap-2">
                            <XCircleIcon className="w-5 h-5" />
                            Disconnect
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 bg-light-bg dark:bg-dark-bg">
            <div className="w-full max-w-4xl">
                {renderContent()}
            </div>
        </div>
    );
};

export default LiveDashboardPage;