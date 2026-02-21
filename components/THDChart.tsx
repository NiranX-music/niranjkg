'use client';

import { useState, useEffect } from 'react';
import { PhaseData } from '@/lib/simulation';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Activity } from 'lucide-react';

interface THDChartProps {
  phaseA: PhaseData;
  phaseB: PhaseData;
  phaseC: PhaseData;
}

interface THDDataPoint {
  time: number;
  phaseA: number;
  phaseB: number;
  phaseC: number;
}

export default function THDChart({ phaseA, phaseB, phaseC }: THDChartProps) {
  const [data, setData] = useState<THDDataPoint[]>([]);

  useEffect(() => {
    // Initialize with some data
    const initialData: THDDataPoint[] = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      initialData.push({
        time: now - i * 1000,
        phaseA: Math.random() * 5 + 2,
        phaseB: Math.random() * 5 + 2,
        phaseC: Math.random() * 5 + 2,
      });
    }
    setData(initialData);
  }, []);

  useEffect(() => {
    setData(prev => {
      const newData = [...prev, { 
        time: Date.now(), 
        phaseA: phaseA.thd, 
        phaseB: phaseB.thd, 
        phaseC: phaseC.thd 
      }];
      if (newData.length > 30) {
        newData.shift();
      }
      return newData;
    });
  }, [phaseA.thd, phaseB.thd, phaseC.thd]);

  const formatTime = (time: number) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const maxTHD = Math.max(phaseA.thd, phaseB.thd, phaseC.thd);
  const hasHighTHD = maxTHD > 8;

  return (
    <div className="bg-[#111827] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold text-zinc-300">THD Monitor</span>
        </div>
        <div className={`text-lg font-mono font-bold ${
          hasHighTHD ? 'text-red-500 animate-pulse' : 
          maxTHD > 5 ? 'text-yellow-500' : 'text-purple-500'
        }`}>
          {maxTHD.toFixed(1)}%
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-zinc-400">Phase A</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <span className="text-zinc-400">Phase B</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-zinc-400">Phase C</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-40 bg-zinc-800/30 rounded-lg">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="time" 
              stroke="#6b7280" 
              fontSize={10}
              tickFormatter={formatTime}
              tickLine={false}
            />
            <YAxis 
              domain={[0, 15]}
              stroke="#6b7280" 
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={formatTime}
              formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
            />
            {/* THD threshold area */}
            <ReferenceArea y1={8} y2={15} fill="#ef4444" fillOpacity={0.1} />
            <ReferenceArea y1={5} y2={8} fill="#f59e0b" fillOpacity={0.1} />
            {/* Threshold lines */}
            <Line
              type="monotone"
              dataKey="phaseA"
              stroke="#ef4444"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="phaseB"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="phaseC"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Threshold indicators */}
      <div className="flex justify-between text-[10px] text-zinc-600">
        <span>0%</span>
        <span className="text-yellow-500">Warning: 5%</span>
        <span className="text-red-500">Critical: 8%</span>
        <span>15%</span>
      </div>

      {/* Status */}
      <div className={`text-xs text-center ${
        hasHighTHD ? 'text-red-500' : maxTHD > 5 ? 'text-yellow-500' : 'text-purple-500'
      }`}>
        {hasHighTHD ? (
          <span className="flex items-center justify-center gap-1">
            ⚠️ High harmonic distortion detected
          </span>
        ) : maxTHD > 5 ? (
          <span>⚡ Elevated harmonic levels</span>
        ) : (
          <span>✓ THD within acceptable limits</span>
        )}
      </div>
    </div>
  );
}
