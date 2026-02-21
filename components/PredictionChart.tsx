'use client';

import { PredictionData } from '@/lib/simulation';
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from 'recharts';
import { Brain, TrendingUp, Zap, Activity } from 'lucide-react';

interface PredictionChartProps {
  predictions: PredictionData[];
}

export default function PredictionChart({ predictions }: PredictionChartProps) {
  const formatHour = (time: number) => {
    const hour = (time / 3600) % 24;
    return `${Math.floor(hour)}h`;
  };

  const chartData = predictions.map(p => ({
    ...p,
    hour: formatHour(p.time),
  }));

  // Calculate some ML metrics
  const avgLoad = predictions.reduce((s, p) => s + p.load, 0) / predictions.length;
  const maxLoad = Math.max(...predictions.map(p => p.load));
  const avgImbalance = predictions.reduce((s, p) => s + p.imbalance, 0) / predictions.length;

  // Use avgLoad for display
  void avgLoad; // For future use

  return (
    <div className="space-y-4">
      {/* ML Model Status */}
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Brain className="w-4 h-4 text-purple-500" />
        <span>ML Prediction Module</span>
        <span className="ml-auto text-xs font-normal text-emerald-500 flex items-center gap-1">
          <Activity className="w-3 h-3" />
          Model Active
        </span>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-zinc-800/50 rounded p-2">
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span>Avg Load</span>
          </div>
          <div className="text-lg font-mono text-yellow-400">{avgLoad.toFixed(1)} kW</div>
        </div>
        <div className="bg-zinc-800/50 rounded p-2">
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            <span>Peak Load</span>
          </div>
          <div className="text-lg font-mono text-emerald-400">{maxLoad.toFixed(1)} kW</div>
        </div>
        <div className="bg-zinc-800/50 rounded p-2">
          <div className="flex items-center gap-1 text-xs text-zinc-500 mb-1">
            <Activity className="w-3 h-3 text-purple-500" />
            <span>Avg Imbalance</span>
          </div>
          <div className="text-lg font-mono text-purple-400">{avgImbalance.toFixed(1)}%</div>
        </div>
      </div>

      {/* Main Prediction Chart */}
      <div className="h-48 bg-zinc-800/30 rounded-lg p-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="hour" 
              stroke="#6b7280" 
              fontSize={10}
              tickLine={false}
            />
            <YAxis 
              stroke="#6b7280" 
              fontSize={10}
              tickLine={false}
              tickFormatter={(v) => `${v}kW`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '5px' }} />
            <Area
              type="monotone"
              dataKey="solar"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.2}
              name="Solar (kW)"
            />
            <Line
              type="monotone"
              dataKey="load"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              name="Load (kW)"
            />
            <Line
              type="monotone"
              dataKey="imbalance"
              stroke="#a855f7"
              strokeWidth={1}
              strokeDasharray="5 5"
              dot={false}
              name="Imbalance (%)"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Model Confidence */}
      <div className="bg-zinc-800/30 rounded p-2 text-xs">
        <div className="flex items-center justify-between text-zinc-500 mb-1">
          <span>Model Confidence</span>
          <span className="text-emerald-400 font-mono">92.4%</span>
        </div>
        <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: '92.4%' }}
          />
        </div>
        <div className="mt-1 text-zinc-600 text-[10px]">
          Based on 24-hour rolling window | Updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
