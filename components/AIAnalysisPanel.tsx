'use client';

import { AIAnalysis } from '@/lib/simulation';
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  AlertTriangle, 
  Thermometer, 
  Activity,
  ArrowRight,
  CheckCircle,
  Cpu
} from 'lucide-react';

interface AIAnalysisPanelProps {
  analysis: AIAnalysis | null;
}

interface RiskMeterProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function RiskMeter({ label, value, icon, color }: RiskMeterProps) {
  const getColor = () => {
    if (value >= 70) return '#ef4444';
    if (value >= 40) return '#f59e0b';
    return color;
  };

  return (
    <div className="bg-zinc-800/30 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500">{icon}</span>
          <span className="text-xs text-zinc-400">{label}</span>
        </div>
        <span className="text-sm font-mono font-bold" style={{ color: getColor() }}>
          {value}%
        </span>
      </div>
      <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-500"
          style={{ 
            width: `${Math.min(100, value)}%`,
            backgroundColor: getColor(),
            boxShadow: `0 0 10px ${getColor()}`
          }}
        />
      </div>
    </div>
  );
}

export default function AIAnalysisPanel({ analysis }: AIAnalysisPanelProps) {
  if (!analysis) {
    return (
      <div className="bg-[#111827] rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold text-zinc-300">AI Analysis</span>
        </div>
        <div className="mt-4 text-center text-zinc-500 text-sm">
          Analyzing system data...
        </div>
      </div>
    );
  }

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'phase_reallocation':
        return <Activity className="w-4 h-4 text-blue-400" />;
      case 'reactive_compensation':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'solar_curtailment':
        return <TrendingUp className="w-4 h-4 text-orange-400" />;
      case 'balance_converter':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:
        return 'bg-zinc-500/20 text-zinc-400';
    }
  };

  return (
    <div className="bg-[#111827] rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-semibold text-zinc-300">AI Analysis & Predictions</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-emerald-500">
          <Activity className="w-3 h-3" />
          <span>Live</span>
        </div>
      </div>

      {/* Risk Meters */}
      <div className="grid grid-cols-2 gap-2">
        <RiskMeter 
          label="Phase Imbalance"
          value={analysis.phaseImbalanceRisk}
          icon={<Activity className="w-3 h-3" />}
          color="#10b981"
        />
        <RiskMeter 
          label="Overload"
          value={analysis.overloadProbability}
          icon={<Zap className="w-3 h-3" />}
          color="#10b981"
        />
        <RiskMeter 
          label="Voltage Instability"
          value={analysis.voltageInstabilityRisk}
          icon={<TrendingUp className="w-3 h-3" />}
          color="#10b981"
        />
        <RiskMeter 
          label="Transformer Failure"
          value={analysis.transformerFailureRisk}
          icon={<Thermometer className="w-3 h-3" />}
          color="#10b981"
        />
      </div>

      {/* Harmonic Growth */}
      <div className="bg-zinc-800/30 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-500">Harmonic Growth Rate</span>
          <span className={`text-sm font-mono ${
            analysis.harmonicGrowthRate > 0 ? 'text-red-500' : 'text-emerald-500'
          }`}>
            {analysis.harmonicGrowthRate > 0 ? '+' : ''}{analysis.harmonicGrowthRate}%/h
          </span>
        </div>
        <div className="h-1.5 bg-zinc-700 rounded-full overflow-hidden mt-2">
          <div 
            className={`h-full rounded-full ${analysis.harmonicGrowthRate > 0 ? 'bg-red-500' : 'bg-emerald-500'}`}
            style={{ width: `${Math.min(100, Math.abs(analysis.harmonicGrowthRate) * 10)}%` }}
          />
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-zinc-400">AI Recommendations</div>
        {analysis.recommendations.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-2">
            No recommendations - System operating optimally
          </div>
        ) : (
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {analysis.recommendations.map((rec) => (
              <div 
                key={rec.id}
                className={`rounded-lg p-3 border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start gap-2">
                  {getRecommendationIcon(rec.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-300">{rec.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${getPriorityColor(rec.priority)}`}>
                        {rec.priority}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">{rec.description}</p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400">
                      <ArrowRight className="w-3 h-3" />
                      <span>{rec.expectedImprovement}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model Info */}
      <div className="text-[10px] text-zinc-600 text-center pt-2 border-t border-zinc-700">
        Last updated: {analysis.timestamp instanceof Date ? analysis.timestamp.toLocaleTimeString() : 'N/A'} | 
        Confidence: 92.4%
      </div>
    </div>
  );
}
