import React from 'react';
import Modal from './Modal';
import {
  CheckEngineIcon,
  OilPressureIcon,
  BatteryWarningIcon,
  CoolantTempIcon,
  AbsIcon,
  DscIcon,
  PowerSteeringIcon
} from './icons';

const warningLights = [
  {
    name: 'Check Engine Light (CEL)',
    Icon: CheckEngineIcon,
    color: 'text-orange-500',
    meaning: 'Indicates a malfunction in the engine, emission system, or transmission. It could be anything from a loose gas cap to a serious engine misfire.',
    action: 'Scan the On-Board Diagnostics (OBD-II) port for error codes. Do not ignore this light, as it can lead to catalytic converter damage.'
  },
  {
    name: 'Oil Pressure Warning',
    Icon: OilPressureIcon,
    color: 'text-red-500',
    meaning: 'Indicates critically low engine oil pressure. This is one of the most serious warnings you can see.',
    action: 'STOP THE CAR IMMEDIATELY in a safe location and turn off the engine. Check the oil level. Do not restart the engine until the cause is identified and fixed to prevent catastrophic engine failure.'
  },
  {
    name: 'Charging System (Battery) Warning',
    Icon: BatteryWarningIcon,
    color: 'text-red-500',
    meaning: 'Indicates a problem with the electrical charging system, usually a failing alternator or a broken serpentine belt.',
    action: 'The car is running on battery power alone and will die soon. Turn off all non-essential electronics (radio, A/C) and drive to a mechanic immediately.'
  },
  {
    name: 'High Coolant Temperature Warning',
    Icon: CoolantTempIcon,
    color: 'text-red-500',
    meaning: 'The engine is overheating. This can be caused by low coolant, a leak, a bad fan, or a failing water pump.',
    action: 'Pull over safely and shut off the engine as soon as possible to prevent severe engine damage. Let it cool down completely before checking coolant levels. Do not open a hot radiator cap.'
  },
  {
    name: 'Power Steering Malfunction',
    Icon: PowerSteeringIcon,
    color: 'text-red-500',
    meaning: 'Indicates a fault in the Electronic Power Steering (EPS) system. Steering will become very heavy and difficult.',
    action: 'Check the power steering connections. Restarting the car can sometimes temporarily reset the system. Professional diagnosis is required.'
  },
  {
    name: 'ABS Warning Light',
    Icon: AbsIcon,
    color: 'text-orange-500',
    meaning: 'Indicates a fault in the Anti-lock Braking System (ABS). Your normal brakes will still work, but ABS will not activate in an emergency stop.',
    action: 'Drive with caution, leaving extra following distance. The system needs to be scanned for ABS-specific codes to diagnose the faulty sensor or module.'
  },
  {
    name: 'DSC / Traction Control Light',
    Icon: DscIcon,
    color: 'text-orange-500',
    meaning: 'A solid light indicates the Dynamic Stability Control (DSC) system has been manually turned off or has a fault. A flashing light means the system is actively working to prevent wheel spin.',
    action: 'If solid, try pressing the DSC button to turn it back on. If it stays on, there is a fault. This system is often linked with the ABS, so a fault in one can disable the other.'
  }
];

interface WarningLightGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WarningLightGuideModal: React.FC<WarningLightGuideModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="RX-8 Warning Light Guide">
      <div className="max-h-[70vh] overflow-y-auto pr-2 -mr-2 scroll-smooth">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          A quick reference for common dashboard warning lights. For a detailed diagnosis, start a new session.
        </p>
        <div className="space-y-4">
          {warningLights.map((light) => (
            <div key={light.name} className="bg-slate-100/80 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-200 dark:border-slate-600/50">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <light.Icon className={`w-10 h-10 ${light.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 dark:text-white">{light.name}</h4>
                  <div className="mt-2">
                    <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 tracking-wider">What it means</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{light.meaning}</p>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-semibold uppercase text-red-500 tracking-wider">What to do</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{light.action}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default WarningLightGuideModal;