import { useState, useRef, useCallback } from 'react';
import { ConnectionStatus, VehicleData } from '../types';

// FIX: Add minimal type definitions for Web Bluetooth API to fix compile errors.
// The default TypeScript lib doesn't include `web-bluetooth` so we define the
// types used in this file manually.
interface BluetoothDevice {
    name?: string;
    gatt?: {
        connect(): Promise<BluetoothRemoteGATTServer>;
    };
    addEventListener(type: 'gattserverdisconnected', listener: (this: this, ev: Event) => any): void;
}

interface BluetoothRemoteGATTServer {
    connected: boolean;
    disconnect(): void;
    getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
    getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
    value?: DataView;
    startNotifications(): Promise<this>;
    stopNotifications(): Promise<this>;
    writeValueWithResponse(value: BufferSource): Promise<void>;
    writeValueWithoutResponse(value: BufferSource): Promise<void>;
    addEventListener(type: 'characteristicvaluechanged', listener: (this: this, ev: Event) => any): void;
    removeEventListener(type: 'characteristicvaluechanged', listener: (this: this, ev: Event) => any): void;
}

declare global {
    interface Navigator {
        bluetooth: {
            requestDevice(options?: any): Promise<BluetoothDevice>;
        };
    }
}


const initialData: VehicleData = {
    rpm: 0,
    coolantTemp: 0,
    speed: 0,
    throttlePos: 0,
    stft: 0,
    voltage: 0,
};

// Standard OBD-II PIDs to query
const PIDS: { pid: string; key: keyof VehicleData }[] = [
    { pid: '010C', key: 'rpm' },
    { pid: '0105', key: 'coolantTemp' },
    { pid: '010D', key: 'speed' },
    { pid: '0111', key: 'throttlePos' },
    { pid: '0106', key: 'stft' }, // STFT Bank 1
    { pid: '0142', key: 'voltage' },
];

const parseOBD2Response = (pid: string, response: string): number | null => {
    // Expected response format is "41 0C 1A F8"
    const parts = response.trim().split(' ').slice(2); // Skip mode (41) and PID (0C)
    if (parts.length < 1) return null;

    const a = parseInt(parts[0], 16);
    const b = parts.length > 1 ? parseInt(parts[1], 16) : 0;

    switch (pid) {
        case '010C': return ((a * 256) + b) / 4; // RPM
        case '0105': return a - 40; // Coolant Temp (°C)
        case '010D': return a; // Speed (km/h)
        case '0111': return (a * 100) / 255; // Throttle (%)
        case '0106': return ((a - 128) * 100) / 128; // STFT (%)
        case '0142': return ((a * 256) + b) / 1000; // Voltage (V)
        default: return null;
    }
};

export const useOBD2 = () => {
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const [data, setData] = useState<VehicleData>(initialData);
    const [error, setError] = useState<string | null>(null);
    const [deviceName, setDeviceName] = useState<string | null>(null);

    const serverRef = useRef<BluetoothRemoteGATTServer | null>(null);
    const characteristicRef = useRef<BluetoothRemoteGATTCharacteristic | null>(null);
    const intervalRef = useRef<number | null>(null);
    const pidIndexRef = useRef<number>(0);
    const responseBufferRef = useRef<string>('');

    const writeToCharacteristic = async (command: string) => {
        if (!characteristicRef.current) return;
        try {
            const encoder = new TextEncoder();
            // Use writeValueWithResponse for critical setup commands, without for PID polling
            if(command.startsWith('AT')) {
                 await characteristicRef.current.writeValueWithResponse(encoder.encode(command + '\r'));
            } else {
                 await characteristicRef.current.writeValueWithoutResponse(encoder.encode(command + '\r'));
            }
        } catch (e) {
            console.error('Write error:', e);
            setError('Failed to send command to OBD-2 adapter.');
            disconnect();
        }
    };
    
    const disconnect = useCallback(async () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        if (characteristicRef.current) {
            try {
                await characteristicRef.current.stopNotifications();
                characteristicRef.current.removeEventListener('characteristicvaluechanged', handleNotifications);
            } catch (e) {
                console.warn('Could not stop notifications:', e);
            }
            characteristicRef.current = null;
        }
        if (serverRef.current?.connected) {
            serverRef.current.disconnect();
        }
        serverRef.current = null;
        setDeviceName(null);
        setStatus('disconnected');
        setData(initialData);
    }, []);

    const handleNotifications = (event: Event) => {
        // FIX: Cast event.target to unknown first to satisfy TypeScript's type overlap requirement for converting a generic EventTarget to a specific BluetoothRemoteGATTCharacteristic.
        const target = event.target as unknown as BluetoothRemoteGATTCharacteristic;
        if (!target.value) return;
        const value = new TextDecoder().decode(target.value);
        responseBufferRef.current += value;

        if (responseBufferRef.current.includes('>')) {
            const responses = responseBufferRef.current.split('>');
            const fullResponses = responses.slice(0, -1);
            responseBufferRef.current = responses[responses.length - 1];

            fullResponses.forEach(response => {
                const cleanedResponse = response.replace(/(\r\n|\n|\r)/gm, " ").trim();
                const lines = cleanedResponse.split(' ').filter(Boolean);
                if (lines[0] !== '41') return; // Not a Mode 1 response

                const pidResponse = lines[1];
                const matchingPid = PIDS.find(p => p.pid.substring(2) === pidResponse);
                if (matchingPid) {
                    const parsedValue = parseOBD2Response(matchingPid.pid, lines.join(' '));
                    if (parsedValue !== null) {
                        setData(prev => ({...prev, [matchingPid.key]: parsedValue}));
                    }
                }
            });
        }
    };

    const sendNextPID = async () => {
        if (!characteristicRef.current) return;
        const current = PIDS[pidIndexRef.current];
        await writeToCharacteristic(current.pid);
        pidIndexRef.current = (pidIndexRef.current + 1) % PIDS.length;
    };


    const connect = async () => {
        setError(null);
        if (!navigator.bluetooth) {
            setError('Web Bluetooth is not available. Please use a compatible browser like Chrome on Android or a desktop computer.');
            setStatus('error');
            return;
        }

        setStatus('connecting');

        try {
            const device = await navigator.bluetooth.requestDevice({
                filters: [
                    { namePrefix: 'OBD' }, 
                    { namePrefix: 'V-LINK' }, 
                    { services: ['00001101-0000-1000-8000-00805f9b34fb'] }
                ],
                optionalServices: ['0000ffe0-0000-1000-8000-00805f9b34fb'] // For some clones
            });
            
            setDeviceName(device.name || 'OBD-2 Adapter');
            device.addEventListener('gattserverdisconnected', () => {
                setError('Device disconnected.');
                disconnect();
            });

            const server = await device.gatt?.connect();
            if (!server) throw new Error('Could not connect to GATT server.');
            serverRef.current = server;

            let service;
            try { // Try standard Serial Port Profile first
                service = await server.getPrimaryService('00001101-0000-1000-8000-00805f9b34fb');
            } catch (e) { // Fallback for cheap clones
                service = await server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
            }

            const characteristic = await service.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
            characteristicRef.current = characteristic;

            await characteristic.startNotifications();
            characteristic.addEventListener('characteristicvaluechanged', handleNotifications);
            
            // Initialize ELM327 adapter
            await writeToCharacteristic('ATZ'); // Reset
            await writeToCharacteristic('ATE0'); // Echo off
            await writeToCharacteristic('ATH1'); // Headers on (to get PID back in response)
            await writeToCharacteristic('ATSP0'); // Set protocol to auto

            setStatus('connected');
            intervalRef.current = window.setInterval(sendNextPID, 250); // Query 4 times a second

        } catch (e: any) {
            console.error(e);
            if (e.name === 'NotFoundError') {
                setError('No device selected or found.');
            } else if (e.name === 'SecurityError' && e.message.includes('permissions policy')) {
                setError('Bluetooth access denied by browser policy. Please ensure the app has permissions and try reloading the page.');
            } else {
                setError(`Connection failed: ${e.message}`);
            }
            setStatus('error');
            setDeviceName(null);
        }
    };

    return { status, data, error, deviceName, connect, disconnect };
};