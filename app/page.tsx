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
  Brain,
  Settings
} from 'lucide-react';
import TransformerVisualization from '@/components/TransformerVisualization';
import HouseGrid from '@/components/HouseGrid';
import PowerQualityPanel from '@/components/PowerQualityPanel';
import AlertsPanel from '@/components/AlertsPanel';
import PredictionChart from '@/components/PredictionChart';
import ConfigurationPanel from '@/components/ConfigurationPanel';
import { 
  SimulationState, 
  PredictionData, 
  WeatherCondition,
  createInitialState, 
  updateSimulation,
  generatePredictions 
} from '@/lib/simulation';
import { exportToCSV, exportToPDF } from '@/lib/export';

export default function Dashboard() {
  // Configuration state
  const [houseCount, setHouseCount] = useState(50);
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [industrialMode, setIndustrialMode] = useState(false);
  const [aiBalancerEnabled, setAiBalancerEnabled] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Simulation state - initialize directly
  const [state, setState] = useState<SimulationState>(createInitialState(50, 'sunny'));
  const [predictions, setPredictions] = useState<PredictionData[]>(() => generatePredictions(createInitialState(50, 'sunny'), 24));
  const [showConfig, setShowConfig] = useState(false);
  const [showPredictions, setShowPredictions] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Regenerate state when house count changes
  const handleHouseCountChange = (newCount: number) => {
    setHouseCount(newCount);
    const newState = createInitialState(newCount, weather);
    setState(newState);
    setPredictions(generatePredictions(newState, 24));
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
          });
          
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
  }, [state.isRunning, simulationSpeed, houseCount, weather, industrialMode, aiBalancerEnabled]);

  // Control functions
  const handleStartStop = () => {
    setState(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const handleReset = () => {
    setState(createInitialState(houseCount, weather));
    setPredictions(generatePredictions(createInitialState(houseCount, weather), 24));
  };

  const handleExportCSV = () => {
    exportToCSV(state);
  };

  const handleExportPDF = () => {
    exportToPDF(state, predictions);
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
      {/* Top Navigation Bar */}
      <nav className="h-16 bg-[#111827] border-b border-zinc-800 px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold font-mono text-emerald-400">SmartGridSim</h1>
            <p className="text-[10px] text-zinc-500">Research Edition v1.0</p>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center gap-4">
          {/* Time Display */}
          <div className="bg-zinc-800/50 px-4 py-2 rounded-lg">
            <span className="text-xs text-zinc-500 mr-2">Sim Time:</span>
            <span className="font-mono text-emerald-400">{formatTime(state.time)}</span>
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
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${state.isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
            <span className="text-xs text-zinc-500">{state.isRunning ? 'RUNNING' : 'PAUSED'}</span>
          </div>
        </div>

        {/* Export Actions */}
        <div className="flex items-center gap-2">
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
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              showConfig ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800/50 text-zinc-400 hover:text-white'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-4 grid grid-cols-12 gap-4 h-[calc(100vh-64px)]">
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
            <div className="flex justify-between mt-1 text-[10px] text-zinc-600">
              <span>Balanced</span>
              <span>Warning</span>
              <span>Critical</span>
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
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
          {/* Transformer Visualization */}
          <div className="flex-1 bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-zinc-300">3-Phase Distribution Transformer</span>
            </div>
            <div className="h-[280px]">
              <TransformerVisualization state={state} />
            </div>
          </div>

          {/* House Grid */}
          <div className="bg-[#111827] rounded-xl p-4 max-h-[300px] overflow-y-auto">
            <HouseGrid houses={state.houses} />
          </div>
        </div>

        {/* Right Panel - Metrics */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
          {/* Power Quality */}
          <div className="bg-[#111827] rounded-xl p-4">
            <PowerQualityPanel 
              phaseA={state.phaseA}
              phaseB={state.phaseB}
              phaseC={state.phaseC}
              neutralCurrent={state.neutralCurrent}
            />
          </div>

          {/* Alerts */}
          <div className="bg-[#111827] rounded-xl p-4 flex-1">
            <AlertsPanel alerts={state.alerts} />
          </div>
        </div>

        {/* Bottom Panel - Predictions */}
        {showPredictions && (
          <div className="col-span-12 bg-[#111827] rounded-xl p-4">
            <button 
              onClick={() => setShowPredictions(false)}
              className="w-full flex items-center justify-between mb-2"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-semibold text-zinc-300">ML Prediction Module</span>
              </div>
              <span className="text-xs text-zinc-500">▼ Collapse</span>
            </button>
            <PredictionChart predictions={predictions} />
          </div>
        )}
      </main>
    </div>
  );
}
