'use client';

import { SimulationState } from '@/lib/simulation';

interface TransformerVisualizationProps {
  state: SimulationState;
}

export default function TransformerVisualization({ state }: TransformerVisualizationProps) {
  const { phaseA, phaseB, phaseC, neutralCurrent } = state;
  
  const getVoltageColor = (voltage: number) => {
    if (voltage < 220) return '#ef4444';
    if (voltage < 230) return '#f59e0b';
    return '#10b981';
  };

  const getCurrentBarHeight = (current: number) => {
    const maxCurrent = 150;
    return Math.min(100, (current / maxCurrent) * 100);
  };

  return (
    <div className="relative w-full h-full min-h-[300px] bg-[#0a0f1a] rounded-lg overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10" 
        style={{ 
          backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      />

      {/* Transformer Core */}
      <svg viewBox="0 0 400 300" className="w-full h-full p-4">
        {/* Phase Lines */}
        <defs>
          <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="1" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Power Flow Lines - Phase A */}
        <path
          d="M 50 150 Q 100 150 120 150"
          stroke="#ef4444"
          strokeWidth="4"
          fill="none"
          className="opacity-60"
        />
        <path
          d="M 280 150 Q 300 150 350 150"
          stroke="#ef4444"
          strokeWidth="4"
          fill="none"
          className="opacity-60"
        />

        {/* Power Flow Lines - Phase B */}
        <path
          d="M 50 120 Q 100 120 120 120"
          stroke="#eab308"
          strokeWidth="4"
          fill="none"
          className="opacity-60"
        />
        <path
          d="M 280 120 Q 300 120 350 120"
          stroke="#eab308"
          strokeWidth="4"
          fill="none"
          className="opacity-60"
        />

        {/* Power Flow Lines - Phase C */}
        <path
          d="M 50 180 Q 100 180 120 180"
          stroke="#3b82f6"
          strokeWidth="4"
          fill="none"
          className="opacity-60"
        />
        <path
          d="M 280 180 Q 300 180 350 180"
          stroke="#3b82f6"
          strokeWidth="4"
          fill="none"
          className="opacity-60"
        />

        {/* Neutral Line */}
        <path
          d="M 50 220 Q 100 220 120 220"
          stroke="#a855f7"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8,4"
          className="opacity-50"
        />
        <path
          d="M 280 220 Q 300 220 350 220"
          stroke="#a855f7"
          strokeWidth="3"
          fill="none"
          strokeDasharray="8,4"
          className="opacity-50"
        />

        {/* Transformer Body */}
        <rect x="120" y="80" width="160" height="140" rx="8" fill="#1f2937" stroke="#374151" strokeWidth="2" />
        
        {/* Transformer Core (inner) */}
        <rect x="135" y="95" width="130" height="110" rx="4" fill="#111827" stroke="#10b981" strokeWidth="1" />

        {/* Phase Windings */}
        <ellipse cx="170" cy="115" rx="25" ry="35" fill="none" stroke="#ef4444" strokeWidth="3" />
        <ellipse cx="200" cy="115" rx="25" ry="35" fill="none" stroke="#eab308" strokeWidth="3" />
        <ellipse cx="230" cy="115" rx="25" ry="35" fill="none" stroke="#3b82f6" strokeWidth="3" />

        {/* Center tap (neutral) */}
        <circle cx="200" cy="170" r="15" fill="#111827" stroke="#a855f7" strokeWidth="2" />
        <text x="200" y="174" textAnchor="middle" fill="#a855f7" fontSize="10" fontFamily="monospace">N</text>

        {/* Phase Labels */}
        <text x="50" y="145" fill="#ef4444" fontSize="12" fontFamily="monospace">A</text>
        <text x="50" y="115" fill="#eab308" fontSize="12" fontFamily="monospace">B</text>
        <text x="50" y="175" fill="#3b82f6" fontSize="12" fontFamily="monospace">C</text>

        {/* Output Labels */}
        <text x="355" y="145" fill="#ef4444" fontSize="12" fontFamily="monospace">A</text>
        <text x="355" y="115" fill="#eab308" fontSize="12" fontFamily="monospace">B</text>
        <text x="355" y="175" fill="#3b82f6" fontSize="12" fontFamily="monospace">C</text>
        <text x="355" y="215" fill="#a855f7" fontSize="10" fontFamily="monospace">N</text>

        {/* Voltage Meters - Phase A */}
        <g transform="translate(50, 250)">
          <rect x="0" y="0" width="60" height="30" rx="4" fill="#1f2937" stroke={getVoltageColor(phaseA.voltage)} strokeWidth="2" />
          <text x="30" y="12" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">A</text>
          <text x="30" y="23" textAnchor="middle" fill={getVoltageColor(phaseA.voltage)} fontSize="11" fontFamily="monospace">
            {phaseA.voltage.toFixed(1)}V
          </text>
        </g>

        {/* Voltage Meters - Phase B */}
        <g transform="translate(120, 250)">
          <rect x="0" y="0" width="60" height="30" rx="4" fill="#1f2937" stroke={getVoltageColor(phaseB.voltage)} strokeWidth="2" />
          <text x="30" y="12" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">B</text>
          <text x="30" y="23" textAnchor="middle" fill={getVoltageColor(phaseB.voltage)} fontSize="11" fontFamily="monospace">
            {phaseB.voltage.toFixed(1)}V
          </text>
        </g>

        {/* Voltage Meters - Phase C */}
        <g transform="translate(190, 250)">
          <rect x="0" y="0" width="60" height="30" rx="4" fill="#1f2937" stroke={getVoltageColor(phaseC.voltage)} strokeWidth="2" />
          <text x="30" y="12" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">C</text>
          <text x="30" y="23" textAnchor="middle" fill={getVoltageColor(phaseC.voltage)} fontSize="11" fontFamily="monospace">
            {phaseC.voltage.toFixed(1)}V
          </text>
        </g>

        {/* Neutral Current */}
        <g transform="translate(270, 250)">
          <rect x="0" y="0" width="70" height="30" rx="4" fill="#1f2937" stroke="#a855f7" strokeWidth="2" />
          <text x="35" y="12" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">NEUTRAL</text>
          <text x="35" y="23" textAnchor="middle" fill="#a855f7" fontSize="11" fontFamily="monospace">
            {neutralCurrent.toFixed(1)}A
          </text>
        </g>

        {/* Current Bars */}
        <g transform="translate(50, 285)">
          {/* Phase A */}
          <rect x="0" y={20 - getCurrentBarHeight(phaseA.current)} width="15" height={getCurrentBarHeight(phaseA.current)} fill="#ef4444" rx="2" />
          <text x="7" y="35" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">{phaseA.current.toFixed(1)}</text>
          
          {/* Phase B */}
          <rect x="25" y={20 - getCurrentBarHeight(phaseB.current)} width="15" height={getCurrentBarHeight(phaseB.current)} fill="#eab308" rx="2" />
          <text x="32" y="35" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">{phaseB.current.toFixed(1)}</text>
          
          {/* Phase C */}
          <rect x="50" y={20 - getCurrentBarHeight(phaseC.current)} width="15" height={getCurrentBarHeight(phaseC.current)} fill="#3b82f6" rx="2" />
          <text x="57" y="35" textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="monospace">{phaseC.current.toFixed(1)}</text>
        </g>

        {/* Animated power flow particles */}
        {state.isRunning && (
          <>
            <circle r="4" fill="#10b981">
              <animateMotion 
                dur="2s" 
                repeatCount="indefinite"
                path="M 50 150 Q 100 150 120 150 L 280 150 Q 300 150 350 150"
              />
            </circle>
            <circle r="4" fill="#10b981">
              <animateMotion 
                dur="2s" 
                repeatCount="indefinite"
                begin="0.5s"
                path="M 50 120 Q 100 120 120 120 L 280 120 Q 300 120 350 120"
              />
            </circle>
            <circle r="4" fill="#10b981">
              <animateMotion 
                dur="2s" 
                repeatCount="indefinite"
                begin="1s"
                path="M 50 180 Q 100 180 120 180 L 280 180 Q 300 180 350 180"
              />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}
