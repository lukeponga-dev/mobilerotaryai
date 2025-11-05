import React, { useEffect } from 'react';
import Button from '../components/Button';
import { BoltIcon, XCircleIcon } from '../components/icons';
import Gauge from '../components/Gauge';
import DataBox from '../components/DataBox';
import { useOBD2 } from '../hooks/useOBD2';

const LiveDashboardPage: React.FC = () => {
    const { status, data, error, deviceName, connect, disconnect } = useOBD2();

    useEffect(() => {
        // Ensure disconnection when the component unmounts
        return () => {
            if (status !== 'disconnected') {
                disconnect();
            }
        };
    }, [status, disconnect]);

    const renderContent = () => {
        if (status === 'disconnected' || status === 'error') {
            return (
                <div className="text-center">
                    <BoltIcon className="w-24 h-24 mx-auto text-light-muted dark:text-dark-muted mb-4" />
                    <h2 className="text-2xl font-bold mb-2">OBD-2 Live Data</h2>
                    <p className="text-light-muted dark:text-dark-muted mb-6 max-w-md mx-auto">Connect to your Bluetooth OBD-2 adapter to view real-time engine data directly from your RX-8.</p>
                    {error && (
                        <p className="text-danger bg-danger/10 p-3 rounded-md mb-6 max-w-md mx-auto">
                            {error}
                        </p>
                    )}
                    <Button onClick={connect} size="lg" variant="primary" className="gap-2">
                        <BoltIcon className="w-5 h-5" />
                        Connect to Adapter
                    </Button>
                </div>
            );
        }

        if (status === 'connecting') {
            return (
                <div className="text-center">
                    <BoltIcon className="w-24 h-24 mx-auto text-accent animate-pulse mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Connecting...</h2>
                    <p className="text-light-muted dark:text-dark-muted">Please select your OBD-2 adapter from the Bluetooth device list.</p>
                </div>
            );
        }

        return (
            <div>
                <div className="text-center mb-6">
                    <p className="text-success font-semibold">Connected to: {deviceName}</p>
                </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="col-span-2">
                        <Gauge value={data.rpm} label="Engine Speed" unit="RPM" max={9000} redline={8500} />
                    </div>
                    <div className="col-span-2">
                        <Gauge value={data.speed} label="Speed" unit="km/h" max={240} />
                    </div>
                    
                    <Gauge 
                        value={data.coolantTemp} 
                        label="Coolant Temp" 
                        unit="°C" 
                        min={60} 
                        max={120} 
                        warning={98} 
                        redline={105} 
                    />
                    <Gauge 
                        value={data.voltage} 
                        label="Voltage" 
                        unit="V" 
                        min={10} 
                        max={16} 
                        lowWarning={13.0}
                        warning={14.8}
                    />
                    
                    <DataBox value={data.throttlePos} label="Throttle" unit="%" />
                    <DataBox value={data.stft} label="STFT" unit="%" />
                    
                    <div className="col-span-full flex items-center justify-center p-4">
                        <Button onClick={disconnect} variant="destructive" className="w-full max-w-xs gap-2">
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
