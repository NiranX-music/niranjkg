'use client';

import { useState, useEffect } from 'react';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart } from 'recharts';
import { Zap } from 'lucide-react';

interface NeutralCurrentChartProps {
  currentValue: number;
  phaseA: number;
  phaseB: number;
  phaseC: number;
}

interface NeutralDataPoint {
  time: number;
  neutral: number;
  phaseA: number;
  phaseB: number;
  phaseC: number;
}

export default function NeutralCurrentChart({ 
  currentValue, 
  phaseA, 
  phaseB, 
  phaseC 
}: NeutralCurrentChartProps) {
  const [data, setData] = useState<NeutralDataPoint[]>([]);

  useEffect(() => {
    const initialData: NeutralDataPoint[] = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const a = Math.random() * 30 + 10;
      const b = Math.random() * 30 + 10;
      const c = Math.random() * 30 + 10;
      initialData.push({
        time: now - i * 1000,
        neutral: Math.abs(a - b) * 0.3 + Math.random() * 3,
        phaseA: a,
        phaseB: b,
        phaseC: c,
      });
    }
    setData(initialData);
  }, []);

  useEffect(() => {
    setData(prev => {
      const newData = [...prev, { 
        time: Date.now(), 
        neutral: currentValue, 
        phaseA, 
        phaseB, 
        phaseC 
      }];
      if (newData.length > 30) {
        newData.shift();
      }
      return newData;
    });
  }, [currentValue, phaseA, phaseB, phaseC]);

  const formatTime = (time: number) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const isHigh = currentValue > 20;
  const isElevated = currentValue > 10;

  return (
    <div className="bg-[#111827] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold text-zinc-300">Neutral Current Timeline</span>
        </div>
        <div className={`text-lg font-mono font-bold ${
          isHigh ? 'text-red-500' : isElevated ? 'text-yellow-500' : 'text-purple-400'
        }`}>
          {currentValue.toFixed(1)} A
        </div>
      </div>

      {/* Phase Currents */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-zinc-400">Phase A: {phaseA.toFixed(1)}A</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-zinc-400">Phase B: {phaseB.toFixed(1)}A</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-zinc-400">Phase C: {phaseC.toFixed(1)}A</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 bg-zinc-800/30 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              fontSize={10}
              tickFormatter={formatTime}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${v}A`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={formatTime}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  neutral: 'Neutral',
                  phaseA: 'Phase A',
                  phaseB: 'Phase B',
                  phaseC: 'Phase C'
                };
                return [`${value.toFixed(1)} A`, labels[name] || name];
              }}
            />
            {/* Phase currents as area */}
            <Area
              type="monotone"
              dataKey="phaseA"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.1}
              strokeWidth={1}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="phaseB"
              stroke="#eab308"
              fill="#eab308"
              fillOpacity={0.1}
              strokeWidth={1}
              dot={false}
            />
            <Area
              type="monotone"
              dataKey="phaseC"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.1}
              strokeWidth={1}
              dot={false}
            />
            {/* Neutral current as line */}
            <Line
              type="monotone"
              dataKey="neutral"
              stroke="#a855f7"
              strokeWidth={3}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-purple-500" />
          <span className="text-zinc-400">Neutral</span>
        </div>
      </div>

      {/* Status */}
      <div className={`text-xs text-center ${
        isHigh ? 'text-red-500' : isElevated ? 'text-yellow-500' : 'text-purple-500'
      }`}>
        {isHigh ? (
          <span className="flex items-center justify-center gap-1">
            ⚠️ High neutral current - significant phase imbalance
          </span>
        ) : isElevated ? (
          <span>⚡ Elevated neutral current - moderate imbalance</span>
        ) : (
          <span>✓ Neutral current within normal range</span>
        )}
      </div>
    </div>
  );
}
