'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  FileText, 
  Zap,
  Activity,
  Settings,
  History,
  Cpu
} from 'lucide-react';
import Link from 'next/link';
import TransformerVisualization from '@/components/TransformerVisualization';
import HouseGrid from '@/components/HouseGrid';
import AdvancedPowerQualityPanel from '@/components/AdvancedPowerQualityPanel';
import AlertsPanel from '@/components/AlertsPanel';
import PredictionChart from '@/components/PredictionChart';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import TransformerStatusPanel from '@/components/TransformerStatusPanel';
import FrequencyChart from '@/components/FrequencyChart';
import AIAnalysisPanel from '@/components/AIAnalysisPanel';
import SensorManagement from '@/components/SensorManagement';
import THDChart from '@/components/THDChart';
import NeutralCurrentChart from '@/components/NeutralCurrentChart';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { 
  SimulationState, 
  PredictionData, 
  WeatherCondition,
  createInitialState, 
  updateSimulation,
  generatePredictions,
  loadSettings,
  saveHistoryRecord,
  GlobalSettings
} from '@/lib/simulation';
import { exportToCSV, exportToPDF } from '@/lib/export';

export default function Dashboard() {
  const { addToast } = useToast();
  
  // Load settings
  const [settings, setSettings] = useState<GlobalSettings>(loadSettings());
  
  // Configuration state
  const [houseCount, setHouseCount] = useState(50);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [industrialMode, setIndustrialMode] = useState(false);
  const [aiBalancerEnabled, setAiBalancerEnabled] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Simulation state - initialize directly
  const [state, setState] = useState<SimulationState>(createInitialState(50, 'sunny'));
  const [predictions, setPredictions] = useState<PredictionData[]>(() => generatePredictions(createInitialState(50, 'sunny'), 24));
  const [showConfig, setShowConfig] = useState(true);
  const [showPredictions, setShowPredictions] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const historyRef = useRef<NodeJS.Timeout | null>(null);

  // Save to history periodically
  useEffect(() => {
    if (state.isRunning) {
      historyRef.current = setInterval(() => {
        const record = {
          id: `record-${Date.now()}`,
          timestamp: new Date(),
          phaseA: state.phaseA,
          phaseB: state.phaseB,
          phaseC: state.phaseC,
          neutralCurrent: state.neutralCurrent,
          frequency: state.frequency,
          transformerStatus: state.transformerStatus,
          phaseImbalance: state.phaseImbalance,
          totalSolarGeneration: state.totalSolarGeneration,
          totalLoad: state.totalLoad,
          aiAnalysis: state.aiAnalysis,
        };
        saveHistoryRecord(record);
      }, 5000); // Save every 5 seconds
    }

    return () => {
      if (historyRef.current) {
        clearInterval(historyRef.current);
      }
    };
  }, [state.isRunning, state]);

  // Regenerate state when house count changes
  const handleHouseCountChange = (newCount: number) => {
    setHouseCount(newCount);
    const newState = createInitialState(newCount, weather);
    setState(newState);
    setPredictions(generatePredictions(newState, 24));
    addToast('success', 'Configuration Updated', `House count changed to ${newCount}`);
  };

  // Update weather 
  const handleWeatherChange = (newWeather: WeatherCondition) => {
    setWeather(newWeather);
    if (!state.isRunning) {
      const updatedState = { 
        ...state, 
        houses: state.houses.map(h => ({
          ...h,
          solarOutput: h.solarOutput * (newWeather === 'sunny' ? 1.5 : newWeather === 'cloudy' ? 0.8 : 0.3)
        }))
      };
      setState(updatedState);
      setPredictions(generatePredictions(updatedState, 24));
    }
    addToast('info', 'Weather Changed', `Weather set to ${newWeather}`);
  };

  // Simulation loop
  useEffect(() => {
    if (state.isRunning) {
      intervalRef.current = setInterval(() => {
        setState(prev => {
          const updated = updateSimulation(prev, {
            houseCount,
            weather,
            industrialMode,
            aiBalancerEnabled,
          }, settings);
          
          // Update predictions periodically
          if (updated.time % 300 === 0) {
            setPredictions(generatePredictions(updated, 24));
          }
          
          return updated;
        });
      }, 1000 / simulationSpeed);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state.isRunning, simulationSpeed, houseCount, weather, industrialMode, aiBalancerEnabled, settings]);

  // Control functions
  const handleStartStop = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleReset = () => {
    setState(createInitialState(houseCount, weather));
    setPredictions(generatePredictions(createInitialState(houseCount, weather), 24));
    addToast('info', 'Simulation Reset', 'System reset to initial state');
  };

  const handleExportCSV = () => {
    exportToCSV(state);
    addToast('success', 'Export Complete', 'CSV report downloaded');
  };

  const handleExportPDF = () => {
    exportToPDF(state, predictions);
    addToast('success', 'Export Complete', 'PDF report downloaded');
  };

  // Handle sensor toggle
  const handleSensorToggle = (sensorId: string) => {
    setState(prev => ({
      ...prev,
      sensors: prev.sensors.map(s => 
        s.id === sensorId ? { ...s, connected: !s.connected } : s
      )
    }));
    
    const sensor = state.sensors.find(s => s.id === sensorId);
    if (sensor) {
      addToast(
        sensor.connected ? 'warning' : 'success',
        sensor.connected ? 'Sensor Disconnected' : 'Sensor Connected',
        `${sensor.name} ${sensor.connected ? 'disconnected' : 'connected'}`
      );
    }
  };

  // Format simulation time
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-zinc-100">
      {/* Navigation */}
      <Navigation />

      {/* Top Controls Bar */}
      <div className="bg-[#111827] border-b border-zinc-800 px-4 py-2 flex items-center justify-between">
        {/* Time Display */}
        <div className="flex items-center gap-4">
          <div className="bg-zinc-800/50 px-4 py-2 rounded-lg">
            <span className="text-xs text-zinc-500 mr-2">Sim Time:</span>
            <span className="font-mono text-emerald-400">{formatTime(state.time)}</span>
          </div>

          {/* Frequency Display */}
          <div className="bg-zinc-800/50 px-4 py-2 rounded-lg">
            <span className="text-xs text-zinc-500 mr-2">Frequency:</span>
            <span className={`font-mono ${
              state.frequency < 49.5 || state.frequency > 50.5 ? 'text-red-500' : 'text-emerald-400'
            }`}>
              {state.frequency.toFixed(2)} Hz
            </span>
          </div>

          {/* Reverse Power Flow Indicator */}
          {state.reversePowerFlow && (
            <div className="bg-yellow-500/20 px-3 py-2 rounded-lg flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-yellow-500">Reverse Power Flow</span>
            </div>
          )}
        </div>

        {/* Play/Stop Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleStartStop}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              state.isRunning 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
              }`}
          >
            {state.isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <button
            onClick={handleReset}
            className="w-10 h-10 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-xs text-zinc-500">{state.isRunning ? 'RUNNING' : 'PAUSED'}</span>
          </div>

          {/* Export Actions */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Report</span>
          </button>
          <Link
            href="/history"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              showConfig ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 grid grid-cols-12 gap-4 min-h-[calc(100vh-144px)] overflow-auto">
        {/* Left Panel - Configuration */}
        <div className={`col-span-12 lg:col-span-3 bg-[#111827] rounded-xl p-4 overflow-y-auto transition-all ${showConfig ? 'block' : 'hidden lg:block'}`}>
          <ConfigurationPanel
            houseCount={houseCount}
            setHouseCount={handleHouseCountChange}
            weather={weather}
            setWeather={handleWeatherChange}
            industrialMode={industrialMode}
            setIndustrialMode={setIndustrialMode}
            aiBalancerEnabled={aiBalancerEnabled}
            setAiBalancerEnabled={setAiBalancerEnabled}
            simulationSpeed={simulationSpeed}
            setSimulationSpeed={setSimulationSpeed}
          />

          {/* Phase Imbalance Display */}
          <div className="mt-6 p-4 bg-zinc-800/50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-zinc-400">Phase Imbalance</span>
              <span className={`text-2xl font-mono font-bold ${
                state.phaseImbalance > 30 ? 'text-red-500' :
                state.phaseImbalance > 15 ? 'text-yellow-500' :
                'text-emerald-400'
              }`}>
                {state.phaseImbalance.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(100, state.phaseImbalance)}%`,
                  backgroundColor: state.phaseImbalance > 30 ? '#ef4444' : state.phaseImbalance > 15 ? '#f59e0b' : '#10b981'
                }}
              />
            </div>
          </div>

          {/* System Stats */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-zinc-800/30 rounded p-3">
              <div className="text-xs text-zinc-500">Total Houses</div>
              <div className="text-xl font-mono text-white">{state.houses.length}</div>
            </div>
            <div className="bg-zinc-800/30 rounded p-3">
              <div className="text-xs text-zinc-500">Active Alerts</div>
              <div className={`text-xl font-mono ${state.alerts.filter(a => a.type === 'CRITICAL').length > 0 ? 'text-red-500' : 'text-white'}`}>
                {state.alerts.length}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Visualization */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4 overflow-y-auto">
          {/* Transformer Visualization */}
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-zinc-300">3-Phase Distribution Transformer</span>
            </div>
            <div className="h-[200px]">
              <TransformerVisualization state={state} />
            </div>
          </div>

          {/* Frequency Chart */}
          <FrequencyChart currentFrequency={state.frequency} />

          {/* House Grid */}
          <div className="bg-[#111827] rounded-xl p-4 max-h-[250px] overflow-y-auto">
            <HouseGrid houses={state.houses} />
          </div>
        </div>

        {/* Right Panel - Metrics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 overflow-y-auto">
          {/* Transformer Status */}
          <TransformerStatusPanel status={state.transformerStatus} />

          {/* Power Quality */}
          <div className="bg-[#111827] rounded-xl p-4">
            <AdvancedPowerQualityPanel 
              phaseA={state.phaseA}
              phaseB={state.phaseB}
              phaseC={state.phaseC}
              neutralCurrent={state.neutralCurrent}
            />
          </div>

          {/* THD Chart */}
          <THDChart 
            phaseA={state.phaseA}
            phaseB={state.phaseB}
            phaseC={state.phaseC}
          />
        </div>

        {/* Bottom Panel - Predictions & AI */}
        {showPredictions && (
          <div className="col-span-12 bg-[#111827] rounded-xl p-4">
            <button 
              onClick={() => setShowPredictions(false)}
              className="w-full flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-zinc-300">ML Prediction & AI Analysis Module</span>
              </div>
              <span className="text-xs text-zinc-500">▼ Collapse</span>
            </button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <PredictionChart predictions={predictions} />
              <AIAnalysisPanel analysis={state.aiAnalysis} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
