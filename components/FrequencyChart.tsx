'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine } from 'recharts';
import { Activity } from 'lucide-react';

interface FrequencyChartProps {
  currentFrequency: number;
}

interface FrequencyDataPoint {
  time: number;
  frequency: number;
}

export default function FrequencyChart({ currentFrequency }: FrequencyChartProps) {
  const [data, setData] = useState<FrequencyDataPoint[]>([]);

  useEffect(() => {
    // Initialize with some data
    const initialData: FrequencyDataPoint[] = [];
    const now = Date.now();
    for (let i = 60; i >= 0; i--) {
      initialData.push({
        time: now - i * 1000,
        frequency: 50 + (Math.random() - 0.5) * 0.2,
      });
    }
    setData(initialData);
  }, []);

  useEffect(() => {
    // Update with new frequency
    setData(prev => {
      const newData = [...prev, { time: Date.now(), frequency: currentFrequency }];
      if (newData.length > 60) {
        newData.shift();
      }
      return newData;
    });
  }, [currentFrequency]);

  const formatTime = (time: number) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const isOutsideSafeBand = currentFrequency < 49.5 || currentFrequency > 50.5;

  return (
    <div className="bg-[#111827] rounded-xl p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-semibold text-zinc-300">Frequency Monitor</span>
        </div>
        <div className={`text-lg font-mono font-bold ${
          isOutsideSafeBand ? 'text-red-500 animate-pulse' : 
          currentFrequency < 49.8 || currentFrequency > 50.2 ? 'text-yellow-500' : 'text-emerald-500'
        }`}>
          {currentFrequency.toFixed(2)} Hz
        </div>
      </div>

      {/* Safe Band Indicator */}
      <div className="flex items-center gap-2 text-xs">
        <div className="flex-1 h-2 bg-gradient-to-r from-red-500 via-emerald-500 to-red-500 rounded-full relative">
          {/* Safe band marker */}
          <div className="absolute left-1/2 top-0 h-full w-16 -translate-x-1/2 bg-emerald-500/30 border-x-2 border-emerald-400" />
          {/* Current position */}
          <div 
            className="absolute top-0 h-full w-1 bg-white rounded-full transition-all duration-300"
            style={{ left: `${((currentFrequency - 49) / 2) * 100}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-zinc-600 font-mono">
        <span>49.0 Hz</span>
        <span className="text-emerald-400">Safe Band (49.5-50.5)</span>
        <span>51.0 Hz</span>
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
              domain={[49, 51]}
              stroke="#6b7280" 
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${v.toFixed(1)}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelFormatter={formatTime}
              formatter={(value: number) => [`${value.toFixed(2)} Hz`, 'Frequency']}
            />
            {/* Safe band reference area */}
            <ReferenceArea y1={49.5} y2={50.5} fill="#10b981" fillOpacity={0.1} />
            {/* Reference lines */}
            <ReferenceLine y={50} stroke="#10b981" strokeDasharray="3 3" />
            <ReferenceLine y={49.5} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
            <ReferenceLine y={50.5} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.5} />
            <Line
              type="monotone"
              dataKey="frequency"
              stroke={isOutsideSafeBand ? '#ef4444' : '#10b981'}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status */}
      <div className={`text-xs text-center ${
        isOutsideSafeBand ? 'text-red-500' : 'text-emerald-500'
      }`}>
        {isOutsideSafeBand ? (
          <span className="flex items-center justify-center gap-1">
            ⚠️ Frequency outside safe operational band
          </span>
        ) : (
          <span>✓ Frequency within safe operational band</span>
        )}
      </div>
    </div>
  );
}
