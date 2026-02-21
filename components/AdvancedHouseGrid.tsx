'use client';

import { useState } from 'react';
import { HouseData } from '@/lib/simulation';
import { Sun, Zap, Home, Thermometer, Cpu } from 'lucide-react';

interface HouseGridProps {
  houses: HouseData[];
}

export default function AdvancedHouseGrid({ houses }: HouseGridProps) {
  const [showDetails, setShowDetails] = useState<number | null>(null);

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

  const activeHouses = houses.filter(h => h.isActive).length;
  const housesWithSolar = houses.filter(h => h.solarOutput > 0).length;
  const housesWithSmartInverter = houses.filter(h => h.hasSmartInverter).length;
  const avgTemperature = houses.reduce((s, h) => s + h.temperature, 0) / houses.length;

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Total</div>
          <div className="text-lg font-mono text-white">{houses.length}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Active</div>
          <div className="text-lg font-mono text-emerald-400">{activeHouses}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Solar</div>
          <div className="text-lg font-mono text-yellow-400">{housesWithSolar}</div>
        </div>
        <div className="bg-zinc-800/50 rounded-lg p-2 text-center">
          <div className="text-xs text-zinc-500">Smart Inv.</div>
          <div className="text-lg font-mono text-purple-400">{housesWithSmartInverter}</div>
        </div>
      </div>

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
              {housesPerPhase[phase].length} houses | Avg Load: {
                (housesPerPhase[phase].reduce((s, h) => s + h.load, 0) / housesPerPhase[phase].length).toFixed(2)
              }kW | Avg Solar: {
                (housesPerPhase[phase].reduce((s, h) => s + h.solarOutput, 0) / housesPerPhase[phase].length).toFixed(2)
              }kW
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {housesPerPhase[phase].slice(0, 35).map((house) => (
              <div
                key={house.id}
                onClick={() => setShowDetails(showDetails === house.id ? null : house.id)}
                className={`relative w-10 h-10 rounded flex items-center justify-center border-2 ${getPhaseColor(phase)} ${
                  house.isActive ? getSolarIntensity(house.solarOutput) : 'bg-zinc-800'
                } transition-all hover:scale-110 cursor-pointer`}
                title={`House ${house.id}`}
              >
                <Home className="w-5 h-5 text-white/80" />
                
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

                {/* Smart inverter indicator */}
                {house.hasSmartInverter && (
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2">
                    <Cpu className="w-2 h-2 text-purple-400" />
                  </div>
                )}
              </div>
            ))}
            {housesPerPhase[phase].length > 35 && (
              <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-xs text-zinc-500">
                +{housesPerPhase[phase].length - 35}
              </div>
            )}
          </div>

          {/* House Details Popup */}
          {showDetails !== null && houses.find(h => h.id === showDetails) && (
            <div className="bg-zinc-800/80 rounded-lg p-3 text-xs space-y-1 mt-2">
              {(() => {
                const house = houses.find(h => h.id === showDetails)!;
                return (
                  <>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">House ID:</span>
                      <span className="text-white font-mono">#{house.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Phase:</span>
                      <span className={phase === 'A' ? 'text-red-400' : phase === 'B' ? 'text-yellow-400' : 'text-blue-400'}>{house.phase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Solar Output:</span>
                      <span className="text-yellow-400">{house.solarOutput.toFixed(2)} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Load:</span>
                      <span className="text-blue-400">{house.load.toFixed(2)} kW</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Temperature:</span>
                      <span className="text-orange-400">{house.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Panel Efficiency:</span>
                      <span className="text-emerald-400">{(house.panelEfficiency * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Smart Inverter:</span>
                      <span className={house.hasSmartInverter ? 'text-purple-400' : 'text-zinc-500'}>
                        {house.hasSmartInverter ? 'Yes' : 'No'}
                      </span>
                    </div>
                    {house.hasSmartInverter && (
                      <div className="flex gap-2 mt-1">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          house.inverterVoltVAREnabled ? 'bg-purple-500/20 text-purple-400' : 'bg-zinc-700 text-zinc-500'
                        }`}>
                          Volt-VAR
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                          house.inverterVoltWattEnabled ? 'bg-blue-500/20 text-blue-400' : 'bg-zinc-700 text-zinc-500'
                        }`}>
                          Volt-Watt
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      ))}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-zinc-700">
        <div className="bg-zinc-800/50 rounded p-2">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Sun className="w-3 h-3 text-yellow-500" />
            Total Solar
          </div>
          <div className="text-lg font-mono text-yellow-400">
            {houses.reduce((s, h) => s + h.solarOutput, 0).toFixed(1)} kW
          </div>
        </div>
        <div className="bg-zinc-800/50 rounded p-2">
          <div className="text-xs text-zinc-500 flex items-center gap-1">
            <Zap className="w-3 h-3 text-blue-500" />
            Total Load
          </div>
          <div className="text-lg font-mono text-blue-400">
            {houses.reduce((s, h) => s + h.load, 0).toFixed(1)} kW
          </div>
        </div>
      </div>
    </div>
  );
}
