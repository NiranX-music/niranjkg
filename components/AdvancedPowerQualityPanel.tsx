'use client';

import { PhaseData } from '@/lib/simulation';
import { 
  Activity, 
  Zap, 
  Gauge, 
  TrendingUp, 
  BarChart3,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

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

interface AdvancedPowerQualityPanelProps {
  phaseA: PhaseData;
  phaseB: PhaseData;
  phaseC: PhaseData;
  neutralCurrent: number;
  showPowerGraph?: boolean;
}

export default function AdvancedPowerQualityPanel({ 
  phaseA, 
  phaseB, 
  phaseC, 
  neutralCurrent,
  showPowerGraph = false 
}: AdvancedPowerQualityPanelProps) {
  const phases = [
    { name: 'Phase A', data: phaseA, color: '#ef4444' },
    { name: 'Phase B', data: phaseB, color: '#eab308' },
    { name: 'Phase C', data: phaseC, color: '#3b82f6' },
  ];

  // Prepare power data for chart
  const powerData = phases.map(p => ({
    name: p.name,
    Active: p.data.power / 1000, // kW
    Reactive: p.data.reactivePower,
    Apparent: p.data.apparentPower,
  }));

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

      {/* Active vs Reactive Power Graph */}
      {showPowerGraph && (
        <div className="bg-zinc-800/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400">Power Distribution (P, Q, S)</span>
          </div>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={powerData} layout="vertical" margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#6b7280" fontSize={10} />
                <YAxis type="category" dataKey="name" stroke="#6b7280" fontSize={10} width={50} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
                <Bar dataKey="Active" fill="#10b981" name="P (kW)" />
                <Bar dataKey="Reactive" fill="#f59e0b" name="Q (kVAR)" />
                <Bar dataKey="Apparent" fill="#3b82f6" name="S (kVA)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

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

      {/* Harmonic Spectrum Display */}
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-purple-500" />
          <span className="text-xs text-zinc-400">Harmonic Spectrum</span>
        </div>
        <div className="space-y-1">
          {[3, 5, 7].map(order => (
            <div key={order} className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 w-8">{order}rd</span>
              <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full"
                  style={{ width: `${(phases[0].data.harmonicSpectrum.find(h => h.order === order)?.percentage || 0) * 5}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 w-12 text-right">
                {phases[0].data.harmonicSpectrum.find(h => h.order === order)?.percentage.toFixed(1) || 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
