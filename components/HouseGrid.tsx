'use client';

import { HouseData } from '@/lib/simulation';
import { Sun, Zap, Home } from 'lucide-react';

interface HouseGridProps {
  houses: HouseData[];
}

export default function HouseGrid({ houses }: HouseGridProps) {
  const housesPerPhase = {
    A: houses.filter(h => h.phase === 'A'),
    B: houses.filter(h => h.phase === 'B'),
    C: houses.filter(h => h.phase === 'C'),
  };

  const maxSolar = 5;

  const getSolarIntensity = (output: number) => {
    const intensity = Math.min(1, output / maxSolar);
    if (intensity > 0.7) return 'bg-emerald-500';
    if (intensity > 0.4) return 'bg-emerald-600';
    if (intensity > 0.1) return 'bg-emerald-700';
    return 'bg-zinc-700';
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'A': return 'border-red-500';
      case 'B': return 'border-yellow-500';
      case 'C': return 'border-blue-500';
      default: return 'border-zinc-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Phase Legend */}
      <div className="flex gap-4 text-xs font-mono">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500"></div>
          <span>Phase A</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500"></div>
          <span>Phase B</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span>Phase C</span>
        </div>
      </div>

      {/* House Grid by Phase */}
      {(['A', 'B', 'C'] as const).map(phase => (
        <div key={phase} className="space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-mono font-bold ${
              phase === 'A' ? 'text-red-500' : phase === 'B' ? 'text-yellow-500' : 'text-blue-500'
            }`}>
              Phase {phase}
            </span>
            <span className="text-xs text-zinc-500">
              {housesPerPhase[phase].length} houses
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {housesPerPhase[phase].slice(0, 35).map((house) => (
              <div
                key={house.id}
                className={`relative w-8 h-8 rounded flex items-center justify-center border-2 ${getPhaseColor(phase)} ${
                  house.isActive ? getSolarIntensity(house.solarOutput) : 'bg-zinc-800'
                } transition-all duration-300 hover:scale-110`}
                title={`House ${house.id} | Solar: ${house.solarOutput.toFixed(2)}kW | Load: ${house.load.toFixed(2)}kW`}
              >
                <Home className="w-4 h-4 text-white/80" />
                
                {/* Solar indicator */}
                {house.solarOutput > 0 && (
                  <div className="absolute -top-1 -right-1">
                    <Sun className="w-3 h-3 text-yellow-400 animate-pulse" />
                  </div>
                )}
                
                {/* Load indicator */}
                {house.load > 0 && (
                  <div className="absolute -bottom-1 -left-1">
                    <Zap className="w-3 h-3 text-white/60" />
                  </div>
                )}
              </div>
            ))}
            {housesPerPhase[phase].length > 35 && (
              <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                +{housesPerPhase[phase].length - 35}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-700">
        <div className="bg-zinc-800/50 rounded p-2">
          <div className="text-xs text-zinc-500">Total Solar</div>
          <div className="text-lg font-mono text-emerald-400">
            {houses.reduce((s, h) => s + h.solarOutput, 0).toFixed(1)} kW
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded p-2">
          <div className="text-xs text-zinc-500">Total Load</div>
          <div className="text-lg font-mono text-blue-400">
            {houses.reduce((s, h) => s + h.load, 0).toFixed(1)} kW
          </div>
        </div>
      </div>
    </div>
  );
}
