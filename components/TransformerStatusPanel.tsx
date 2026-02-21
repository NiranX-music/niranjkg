'use client';

import { TransformerStatus } from '@/lib/simulation';
import { Zap, Heart, Activity } from 'lucide-react';

interface TransformerStatusPanelProps {
  status: TransformerStatus;
}

export default function TransformerStatusPanel({ status }: TransformerStatusPanelProps) {
  const getHealthColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getStateColor = (state: TransformerStatus['operationalState']) => {
    switch (state) {
      case 'NORMAL':
        return '#10b981';
      case 'WARNING':
        return '#f59e0b';
      case 'OVERLOADED':
        return '#f97316';
      case 'CRITICAL':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const getStateLabel = (state: TransformerStatus['operationalState']) => {
    switch (state) {
      case 'NORMAL':
        return 'Normal Operation';
      case 'WARNING':
        return 'Warning';
      case 'OVERLOADED':
        return 'Overloaded';
      case 'CRITICAL':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  // Calculate thermal gauge rotation (0-180 degrees)
  const tempGaugeRotation = Math.min(180, (status.temperature / 120) * 180);
  const loadGaugeRotation = Math.min(180, (status.loadingPercent / 150) * 180);

  return (
    <div className="bg-zinc-800/50 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-zinc-300">Transformer Status</span>
        </div>
        <div 
          className="px-2 py-1 rounded text-xs font-mono font-bold"
          style={{ 
            backgroundColor: `${getStateColor(status.operationalState)}20`,
            color: getStateColor(status.operationalState)
          }}
        >
          {getStateLabel(status.operationalState)}
        </div>
      </div>

      {/* Thermal Gauge */}
      <div className="relative h-24 bg-zinc-900/50 rounded-lg p-2">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-zinc-500 font-mono">
          Temperature
        </div>
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Gauge background */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Gauge value */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={status.temperature > 90 ? '#ef4444' : status.temperature > 70 ? '#f59e0b' : '#10b981'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${tempGaugeRotation * 1.26} 126`}
          />
          {/* Gauge needle */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${tempGaugeRotation - 90} 50 50)`}
          />
          {/* Center dot */}
          <circle cx="50" cy="50" r="4" fill="white" />
        </svg>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-lg font-mono font-bold text-white">
          {status.temperature.toFixed(1)}°C
        </div>
      </div>

      {/* Loading Gauge */}
      <div className="relative h-24 bg-zinc-900/50 rounded-lg p-2">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-zinc-500 font-mono">
          Loading
        </div>
        <svg viewBox="0 0 100 60" className="w-full h-full">
          {/* Gauge background */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="#374151"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Gauge value */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={status.loadingPercent > 100 ? '#ef4444' : status.loadingPercent > 80 ? '#f59e0b' : '#10b981'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${loadGaugeRotation * 1.26} 126`}
          />
          {/* Gauge needle */}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2="20"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            transform={`rotate(${loadGaugeRotation - 90} 50 50)`}
          />
          {/* Center dot */}
          <circle cx="50" cy="50" r="4" fill="white" />
        </svg>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-lg font-mono font-bold text-white">
          {status.loadingPercent.toFixed(1)}%
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-3 h-3" style={{ color: getHealthColor(status.healthScore) }} />
            <span className="text-xs text-zinc-500">Health</span>
          </div>
          <div className="text-xl font-mono font-bold" style={{ color: getHealthColor(status.healthScore) }}>
            {status.healthScore}%
          </div>
        </div>
        <div className="bg-zinc-900/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs text-zinc-500">Total Loss</span>
          </div>
          <div className="text-xl font-mono font-bold text-yellow-500">
            {(status.copperLoss + status.coreLoss).toFixed(2)} kW
          </div>
        </div>
      </div>

      {/* Loss Breakdown */}
      <div className="bg-zinc-900/30 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Copper Loss</span>
          <span className="font-mono text-orange-400">{status.copperLoss.toFixed(2)} kW</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-500">Core Loss</span>
          <span className="font-mono text-blue-400">{status.coreLoss.toFixed(2)} kW</span>
        </div>
        <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-orange-500" style={{ width: `${(status.copperLoss / (status.copperLoss + status.coreLoss + 0.01)) * 100}%` }} />
        </div>
      </div>
    </div>
  );
}
