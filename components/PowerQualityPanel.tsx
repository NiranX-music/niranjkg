'use client';

import { PhaseData } from '@/lib/simulation';
import { Activity, Zap, Gauge, TrendingUp } from 'lucide-react';

interface PhaseMeterProps {
  label: string;
  value: number;
  unit: string;
  min?: number;
  max?: number;
  color: string;
  warningThreshold?: number;
  criticalThreshold?: number;
}

function PhaseMeter({ label, value, unit, min = 0, max = 100, color, warningThreshold, criticalThreshold }: PhaseMeterProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  let statusColor = color;
  
  if (criticalThreshold && value >= criticalThreshold) {
    statusColor = '#ef4444';
  } else if (warningThreshold && value >= warningThreshold) {
    statusColor = '#f59e0b';
  }

  return (
    <div className="bg-zinc-800/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-zinc-500 font-mono">{label}</span>
        <span className={`text-sm font-mono font-bold`} style={{ color: statusColor }}>
          {value.toFixed(1)} {unit}
        </span>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ 
            width: `${Math.min(100, percentage)}%`,
            backgroundColor: statusColor,
            boxShadow: `0 0 10px ${statusColor}`
          }}
        />
      </div>
    </div>
  );
}

interface PowerQualityPanelProps {
  phaseA: PhaseData;
  phaseB: PhaseData;
  phaseC: PhaseData;
  neutralCurrent: number;
}

export default function PowerQualityPanel({ phaseA, phaseB, phaseC, neutralCurrent }: PowerQualityPanelProps) {
  const phases = [
    { name: 'Phase A', data: phaseA, color: '#ef4444' },
    { name: 'Phase B', data: phaseB, color: '#eab308' },
    { name: 'Phase C', data: phaseC, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-4">
      {/* Voltage Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span>Voltage (V)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {phases.map(phase => (
            <PhaseMeter
              key={phase.name}
              label={phase.name}
              value={phase.data.voltage}
              unit="V"
              min={200}
              max={260}
              color={phase.color}
              warningThreshold={230}
              criticalThreshold={220}
            />
          ))}
        </div>
      </div>

      {/* Current Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Zap className="w-4 h-4 text-yellow-500" />
          <span>Current (A)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {phases.map(phase => (
            <PhaseMeter
              key={phase.name}
              label={phase.name}
              value={phase.data.current}
              unit="A"
              min={0}
              max={150}
              color={phase.color}
            />
          ))}
        </div>
      </div>

      {/* Power Factor Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <Gauge className="w-4 h-4 text-blue-500" />
          <span>Power Factor</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {phases.map(phase => (
            <PhaseMeter
              key={phase.name}
              label={phase.name}
              value={phase.data.powerFactor}
              unit=""
              min={0.5}
              max={1}
              color={phase.color}
              warningThreshold={0.8}
              criticalThreshold={0.7}
            />
          ))}
        </div>
      </div>

      {/* THD Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          <span>Total Harmonic Distortion (%)</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {phases.map(phase => (
            <PhaseMeter
              key={phase.name}
              label={phase.name}
              value={phase.data.thd}
              unit="%"
              min={0}
              max={20}
              color={phase.color}
              warningThreshold={5}
              criticalThreshold={8}
            />
          ))}
        </div>
      </div>

      {/* Neutral Current */}
      <div className="bg-zinc-800/50 rounded-lg p-3 mt-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-400">Neutral Current</span>
          <span className={`text-lg font-mono font-bold ${
            neutralCurrent > 20 ? 'text-red-500' : 
            neutralCurrent > 10 ? 'text-yellow-500' : 'text-purple-400'
          }`}>
            {neutralCurrent.toFixed(1)} A
          </span>
        </div>
        <div className="h-2 bg-zinc-700 rounded-full overflow-hidden mt-2">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.min(100, (neutralCurrent / 30) * 100)}%`,
              backgroundColor: neutralCurrent > 20 ? '#ef4444' : neutralCurrent > 10 ? '#f59e0b' : '#a855f7',
              boxShadow: `0 0 10px ${neutralCurrent > 20 ? '#ef4444' : neutralCurrent > 10 ? '#f59e0b' : '#a855f7'}`
            }}
          />
        </div>
      </div>

      {/* Power Values */}
      <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-zinc-700">
        {phases.map(phase => (
          <div key={phase.name} className="text-center">
            <div className="text-xs text-zinc-500">{phase.name}</div>
            <div className="text-lg font-mono font-bold" style={{ color: phase.color }}>
              {(phase.data.power / 1000).toFixed(2)} kW
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
