'use client';

import { WeatherCondition } from '@/lib/simulation';
import { Settings, Sun, Cloud, CloudRain, Factory, Home, Cpu } from 'lucide-react';

interface ConfigurationPanelProps {
  houseCount: number;
  setHouseCount: (count: number) => void;
  weather: WeatherCondition;
  setWeather: (weather: WeatherCondition) => void;
  industrialMode: boolean;
  setIndustrialMode: (enabled: boolean) => void;
  aiBalancerEnabled: boolean;
  setAiBalancerEnabled: (enabled: boolean) => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;
}

export default function ConfigurationPanel({
  houseCount,
  setHouseCount,
  weather,
  setWeather,
  industrialMode,
  setIndustrialMode,
  aiBalancerEnabled,
  setAiBalancerEnabled,
  simulationSpeed,
  setSimulationSpeed,
}: ConfigurationPanelProps) {
  const weatherOptions: { value: WeatherCondition; label: string; icon: React.ReactNode }[] = [
    { value: 'sunny', label: 'Sunny', icon: <Sun className="w-4 h-4 text-yellow-500" /> },
    { value: 'cloudy', label: 'Cloudy', icon: <Cloud className="w-4 h-4 text-zinc-400" /> },
    { value: 'rainy', label: 'Rainy', icon: <CloudRain className="w-4 h-4 text-blue-500" /> },
  ];

  const speedOptions = [1, 2, 5, 10];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Settings className="w-4 h-4 text-zinc-400" />
        <span>Configuration</span>
      </div>

      {/* House Count Slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs text-zinc-500">Number of Houses</label>
          <span className="text-sm font-mono text-emerald-400">{houseCount}</span>
        </div>
        <input
          type="range"
          min={30}
          max={100}
          value={houseCount}
          onChange={(e) => setHouseCount(parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex justify-between text-[10px] text-zinc-600">
          <span>30</span>
          <span>100</span>
        </div>
      </div>

      {/* Weather Selection */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">Weather Condition</label>
        <div className="flex gap-2">
          {weatherOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWeather(opt.value)}
              className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                weather === opt.value
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {opt.icon}
              <span className="text-xs">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">Load Profile</label>
        <div className="flex gap-2">
          <button
            onClick={() => setIndustrialMode(false)}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
              !industrialMode
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="text-xs">Residential</span>
          </button>
          <button
            onClick={() => setIndustrialMode(true)}
            className={`flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border transition-all ${
              industrialMode
                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
            }`}
          >
            <Factory className="w-4 h-4" />
            <span className="text-xs">Industrial</span>
          </button>
        </div>
      </div>

      {/* AI Phase Balancer */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">AI Phase Balancer</label>
        <button
          onClick={() => setAiBalancerEnabled(!aiBalancerEnabled)}
          className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
            aiBalancerEnabled
              ? 'bg-purple-500/20 border-purple-500'
              : 'bg-zinc-800/50 border-zinc-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Cpu className={`w-5 h-5 ${aiBalancerEnabled ? 'text-purple-400' : 'text-zinc-500'}`} />
            <span className={`text-sm ${aiBalancerEnabled ? 'text-purple-300' : 'text-zinc-400'}`}>
              Phase Balancing Converter
            </span>
          </div>
          <div
            className={`w-10 h-5 rounded-full p-0.5 transition-all ${
              aiBalancerEnabled ? 'bg-purple-500' : 'bg-zinc-600'
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white transition-transform ${
                aiBalancerEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </button>
        {aiBalancerEnabled && (
          <div className="text-xs text-purple-400 bg-purple-500/10 p-2 rounded">
            Active: Dynamically redistributing phase loads to minimize imbalance
          </div>
        )}
      </div>

      {/* Simulation Speed */}
      <div className="space-y-2">
        <label className="text-xs text-zinc-500">Simulation Speed</label>
        <div className="flex gap-2">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              onClick={() => setSimulationSpeed(speed)}
              className={`flex-1 p-2 rounded-lg border text-sm font-mono transition-all ${
                simulationSpeed === speed
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
