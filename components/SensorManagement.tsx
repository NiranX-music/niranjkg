'use client';

import { useState } from 'react';
import { SensorData } from '@/lib/simulation';
import { 
  Wifi, 
  WifiOff, 
  Gauge, 
  Thermometer, 
  Zap, 
  Activity, 
  Cpu,
  RefreshCw
} from 'lucide-react';

interface SensorManagementProps {
  sensors: SensorData[];
  onSensorToggle: (sensorId: string) => void;
}

export default function SensorManagement({ sensors, onSensorToggle }: SensorManagementProps) {
  const [showAll, setShowAll] = useState(false);

  const getSensorIcon = (type: SensorData['type']) => {
    switch (type) {
      case 'energy_meter':
        return <Gauge className="w-4 h-4 text-emerald-500" />;
      case 'transformer_temp':
        return <Thermometer className="w-4 h-4 text-orange-500" />;
      case 'neutral_current':
        return <Zap className="w-4 h-4 text-purple-500" />;
      case 'harmonic_analyzer':
        return <Activity className="w-4 h-4 text-blue-500" />;
      case 'feeder_impedance':
        return <Cpu className="w-4 h-4 text-yellow-500" />;
      default:
        return <Gauge className="w-4 h-4 text-zinc-500" />;
    }
  };

  const getSensorTypeLabel = (type: SensorData['type']) => {
    switch (type) {
      case 'energy_meter':
        return 'Energy Meter';
      case 'transformer_temp':
        return 'Temperature';
      case 'neutral_current':
        return 'Neutral Current';
      case 'harmonic_analyzer':
        return 'Harmonic Analyzer';
      case 'feeder_impedance':
        return 'Feeder Impedance';
      default:
        return 'Unknown';
    }
  };

  const connectedSensors = sensors.filter(s => s.connected);
  const displayedSensors = showAll ? sensors : sensors.slice(0, 5);

  return (
    <div className="bg-[#111827] rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">IoT Sensor Layer</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs">
            <Wifi className="w-3 h-3 text-emerald-500" />
            <span className="text-emerald-500">{connectedSensors.length}</span>
            <span className="text-zinc-500">/ {sensors.length}</span>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-zinc-800/30 rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-zinc-400">Connected</span>
          </div>
          <span className="text-sm font-mono text-emerald-400">{connectedSensors.length}</span>
        </div>
        <div className="bg-zinc-800/30 rounded-lg p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-red-500" />
            <span className="text-xs text-zinc-400">Disconnected</span>
          </div>
          <span className="text-sm font-mono text-red-400">{sensors.length - connectedSensors.length}</span>
        </div>
      </div>

      {/* Sensor List */}
      <div className="space-y-2">
        {displayedSensors.map((sensor) => (
          <div 
            key={sensor.id}
            className={`rounded-lg p-3 border transition-all ${
              sensor.connected 
                ? 'bg-zinc-800/30 border-zinc-700' 
                : 'bg-red-500/5 border-red-500/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSensorIcon(sensor.type)}
                <div>
                  <div className="text-xs font-medium text-zinc-300">{sensor.name}</div>
                  <div className="text-[10px] text-zinc-500">{getSensorTypeLabel(sensor.type)}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {sensor.connected && (
                  <div className="text-right">
                    <div className="text-sm font-mono text-white">
                      {sensor.lastReading.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-zinc-500">{sensor.unit}</div>
                  </div>
                )}
                <button
                  onClick={() => onSensorToggle(sensor.id)}
                  className={`p-2 rounded-lg transition-all ${
                    sensor.connected 
                      ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  }`}
                >
                  {sensor.connected ? (
                    <WifiOff className="w-4 h-4" />
                  ) : (
                    <Wifi className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            {sensor.connected && (
              <div className="mt-2 text-[10px] text-zinc-600">
                Last update: {sensor.timestamp instanceof Date ? sensor.timestamp.toLocaleTimeString() : 'N/A'}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {sensors.length > 5 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
        >
          {showAll ? 'Show Less' : `Show All (${sensors.length - 5} more)`}
        </button>
      )}

      {/* Real-time indicator */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-zinc-700">
        <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin" />
        <span className="text-[10px] text-zinc-500">WebSocket Telemetry Active</span>
      </div>
    </div>
  );
}
