'use client';

import { useState, useEffect } from 'react';
import { 
  Download, 
  FileText, 
  Trash2, 
  History,
  Activity,
  Zap,
  Sun,
  Brain,
  AlertTriangle,
  RefreshCw,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { 
  HistoryRecord, 
  getHistoryRecords, 
  clearHistory,
  DEFAULT_SETTINGS,
  GlobalSettings,
  loadSettings
} from '@/lib/simulation';
import { exportHistoryToCSV, exportHistoryToPDF } from '@/lib/export';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

export default function HistoryPage() {
  const { addToast } = useToast();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<GlobalSettings>(loadSettings());

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setIsLoading(true);
    const records = getHistoryRecords();
    setHistory(records);
    setIsLoading(false);
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
    addToast('info', 'History Cleared', 'All historical data has been deleted');
  };

  const handleExportCSV = () => {
    if (history.length === 0) {
      addToast('warning', 'No Data', 'No history records to export');
      return;
    }
    exportHistoryToCSV(history);
    addToast('success', 'Export Complete', 'CSV history report downloaded');
  };

  const handleExportPDF = () => {
    if (history.length === 0) {
      addToast('warning', 'No Data', 'No history records to export');
      return;
    }
    exportHistoryToPDF(history);
    addToast('success', 'Export Complete', 'PDF history report downloaded');
  };

  const handleAutoAnalysis = () => {
    if (history.length === 0) {
      addToast('warning', 'No Data', 'No history data to analyze');
      return;
    }
    
    // Simulate AI analysis
    addToast('info', 'Analysis Started', 'Running AI analysis on historical data...');
    
    setTimeout(() => {
      const avgVoltage = history.reduce((s, r) => s + (r.phaseA.voltage + r.phaseB.voltage + r.phaseC.voltage) / 3, 0) / history.length;
      const avgTHD = history.reduce((s, r) => s + (r.phaseA.thd + r.phaseB.thd + r.phaseC.thd) / 3, 0) / history.length;
      const maxLoad = Math.max(...history.map(r => r.totalLoad));
      const maxSolar = Math.max(...history.map(r => r.totalSolarGeneration));
      const avgImbalance = history.reduce((s, r) => s + r.phaseImbalance, 0) / history.length;
      
      let analysis = 'Historical Analysis Results:\n\n';
      analysis += `• Average Voltage: ${avgVoltage.toFixed(1)}V\n`;
      analysis += `• Average THD: ${avgTHD.toFixed(1)}%\n`;
      analysis += `• Maximum Load: ${maxLoad.toFixed(1)}kW\n`;
      analysis += `• Maximum Solar: ${maxSolar.toFixed(1)}kW\n`;
      analysis += `• Average Phase Imbalance: ${avgImbalance.toFixed(1)}%\n\n`;
      
      if (avgImbalance > 20) {
        analysis += '⚠️ High phase imbalance detected - Consider phase rebalancing\n';
      }
      if (avgTHD > 5) {
        analysis += '⚠️ Elevated harmonic levels - Check for harmonic sources\n';
      }
      if (maxLoad > 80) {
        analysis += '⚠️ High load peaks detected - Consider load management\n';
      }
      
      addToast('success', 'Analysis Complete', 'AI analysis completed successfully');
    }, 2000);
  };

  // Prepare chart data
  const chartData = history.slice(-50).map(r => ({
    time: r.timestamp instanceof Date ? r.timestamp.toLocaleTimeString() : '',
    voltage: (r.phaseA.voltage + r.phaseB.voltage + r.phaseC.voltage) / 3,
    load: r.totalLoad,
    solar: r.totalSolarGeneration,
    imbalance: r.phaseImbalance,
  }));

  // Calculate summary stats
  const avgVoltage = history.length > 0 
    ? history.reduce((s, r) => s + (r.phaseA.voltage + r.phaseB.voltage + r.phaseC.voltage) / 3, 0) / history.length 
    : 0;
  const avgTHD = history.length > 0 
    ? history.reduce((s, r) => s + (r.phaseA.thd + r.phaseB.thd + r.phaseC.thd) / 3, 0) / history.length 
    : 0;
  const maxLoad = history.length > 0 ? Math.max(...history.map(r => r.totalLoad)) : 0;
  const maxSolar = history.length > 0 ? Math.max(...history.map(r => r.totalSolarGeneration)) : 0;
  const avgImbalance = history.length > 0 ? history.reduce((s, r) => s + r.phaseImbalance, 0) / history.length : 0;

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-zinc-100">
      <Navigation />

      {/* Header */}
      <div className="bg-[#111827] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-emerald-500" />
          <h1 className="text-lg font-semibold text-zinc-300">Historical Data & Analysis</h1>
          <span className="text-xs text-zinc-500">({history.length} records)</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={loadHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleAutoAnalysis}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all text-sm"
          >
            <Brain className="w-4 h-4" />
            AI Analysis
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={handleClearHistory}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Clear
          </button>
          <Link
            href="/"
            className="px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-xs text-zinc-500">Avg Voltage</span>
            </div>
            <div className="text-2xl font-mono text-emerald-400">{avgVoltage.toFixed(1)}V</div>
          </div>
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-zinc-500">Avg THD</span>
            </div>
            <div className={`text-2xl font-mono ${avgTHD > 8 ? 'text-red-500' : avgTHD > 5 ? 'text-yellow-500' : 'text-purple-400'}`}>
              {avgTHD.toFixed(1)}%
            </div>
          </div>
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-zinc-500">Max Load</span>
            </div>
            <div className="text-2xl font-mono text-yellow-400">{maxLoad.toFixed(1)}kW</div>
          </div>
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-zinc-500">Max Solar</span>
            </div>
            <div className="text-2xl font-mono text-emerald-400">{maxSolar.toFixed(1)}kW</div>
          </div>
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span className="text-xs text-zinc-500">Avg Imbalance</span>
            </div>
            <div className={`text-2xl font-mono ${avgImbalance > 30 ? 'text-red-500' : avgImbalance > 15 ? 'text-yellow-500' : 'text-emerald-400'}`}>
              {avgImbalance.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-2 gap-4">
          {/* Voltage Trend */}
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-zinc-300">Voltage Trend</span>
            </div>
            <div className="h-48">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis domain={[220, 250]} stroke="#6b7280" fontSize={10} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="voltage"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="Voltage (V)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Load/Solar Trend */}
          <div className="bg-[#111827] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold text-zinc-300">Load vs Solar Trend</span>
            </div>
            <div className="h-48">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="time" stroke="#6b7280" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b7280" fontSize={10} tickLine={false} tickFormatter={(v) => `${v}kW`} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="load"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.2}
                      name="Load (kW)"
                    />
                    <Area
                      type="monotone"
                      dataKey="solar"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.2}
                      name="Solar (kW)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-500">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[#111827] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-semibold text-zinc-300">Recent Records</span>
          </div>
          
          {isLoading ? (
            <div className="text-center py-8 text-zinc-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No historical records</p>
              <p className="text-xs">Start the simulation to record data</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-2 text-zinc-500">Time</th>
                    <th className="text-left py-2 px-2 text-zinc-500">Voltage (A/B/C)</th>
                    <th className="text-left py-2 px-2 text-zinc-500">Load</th>
                    <th className="text-left py-2 px-2 text-zinc-500">Solar</th>
                    <th className="text-left py-2 px-2 text-zinc-500">Imbalance</th>
                    <th className="text-left py-2 px-2 text-zinc-500">THD</th>
                    <th className="text-left py-2 px-2 text-zinc-500">Xfmr Load</th>
                    <th className="text-left py-2 px-2 text-zinc-500">Temp</th>
                  </tr>
                </thead>
                <tbody>
                  {history.slice(-20).reverse().map((record, idx) => (
                    <tr key={idx} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="py-2 px-2 font-mono text-zinc-400">
                        {record.timestamp instanceof Date ? record.timestamp.toLocaleTimeString() : 'N/A'}
                      </td>
                      <td className="py-2 px-2">
                        <span className="text-red-400">{record.phaseA.voltage.toFixed(0)}</span>/
                        <span className="text-yellow-400">{record.phaseB.voltage.toFixed(0)}</span>/
                        <span className="text-blue-400">{record.phaseC.voltage.toFixed(0)}</span>
                      </td>
                      <td className="py-2 px-2 font-mono text-yellow-400">{record.totalLoad.toFixed(1)} kW</td>
                      <td className="py-2 px-2 font-mono text-emerald-400">{record.totalSolarGeneration.toFixed(1)} kW</td>
                      <td className={`py-2 px-2 font-mono ${
                        record.phaseImbalance > 30 ? 'text-red-500' : 
                        record.phaseImbalance > 15 ? 'text-yellow-500' : 'text-emerald-400'
                      }`}>
                        {record.phaseImbalance.toFixed(1)}%
                      </td>
                      <td className={`py-2 px-2 font-mono ${
                        record.phaseA.thd > 8 ? 'text-red-500' : 
                        record.phaseA.thd > 5 ? 'text-yellow-500' : 'text-purple-400'
                      }`}>
                        {((record.phaseA.thd + record.phaseB.thd + record.phaseC.thd) / 3).toFixed(1)}%
                      </td>
                      <td className="py-2 px-2 font-mono text-zinc-300">{record.transformerStatus.loadingPercent.toFixed(0)}%</td>
                      <td className="py-2 px-2 font-mono text-orange-400">{record.transformerStatus.temperature.toFixed(0)}°C</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
