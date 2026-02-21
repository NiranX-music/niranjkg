'use client';

import { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw,
  AlertTriangle,
  Activity,
  Zap,
  Thermometer,
  TrendingUp,
  Cpu,
  Moon,
  Sun
} from 'lucide-react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import { useToast } from '@/components/Toast';
import { GlobalSettings, DEFAULT_SETTINGS, saveSettings, loadSettings } from '@/lib/simulation';

export default function SettingsPage() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);
  const [savedSettings, setSavedSettings] = useState<GlobalSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setSavedSettings(loaded);
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSavedSettings(settings);
    addToast('success', 'Settings Saved', 'All settings have been saved successfully');
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    addToast('info', 'Settings Reset', 'All settings have been reset to defaults');
  };

  const handleRestoreSaved = () => {
    setSettings(savedSettings);
    addToast('info', 'Settings Restored', 'Settings restored to saved values');
  };

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  return (
    <div className="min-h-screen bg-[#0a0f1a] text-zinc-100">
      <Navigation />

      {/* Header */}
      <div className="bg-[#111827] border-b border-zinc-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-emerald-500" />
          <h1 className="text-lg font-semibold text-zinc-300">Global Settings</h1>
          {hasChanges && (
            <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-500 text-xs">
              Unsaved Changes
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleRestoreSaved}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-4 h-4" />
            Restore
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700/50 transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save Settings
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
      <main className="p-4 max-w-4xl mx-auto space-y-6">
        
        {/* Voltage Settings */}
        <div className="bg-[#111827] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-zinc-300">Voltage Thresholds</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Minimum Voltage (V)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={200}
                  max={230}
                  value={settings.voltageMin}
                  onChange={(e) => setSettings(s => ({ ...s, voltageMin: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono text-emerald-400">{settings.voltageMin}V</span>
              </div>
              <p className="text-xs text-zinc-600">Alert triggered below this voltage</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Maximum Voltage (V)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={250}
                  max={270}
                  value={settings.voltageMax}
                  onChange={(e) => setSettings(s => ({ ...s, voltageMax: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono text-red-400">{settings.voltageMax}V</span>
              </div>
              <p className="text-xs text-zinc-600">Alert triggered above this voltage</p>
            </div>
          </div>
        </div>

        {/* Frequency Settings */}
        <div className="bg-[#111827] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-zinc-300">Frequency Safe Band</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Minimum Frequency (Hz)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={48}
                  max={50}
                  step={0.1}
                  value={settings.frequencyMin}
                  onChange={(e) => setSettings(s => ({ ...s, frequencyMin: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono text-yellow-400">{settings.frequencyMin.toFixed(1)} Hz</span>
              </div>
              <p className="text-xs text-zinc-600">Lower bound of safe operational band</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Maximum Frequency (Hz)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={50}
                  max={52}
                  step={0.1}
                  value={settings.frequencyMax}
                  onChange={(e) => setSettings(s => ({ ...s, frequencyMax: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono text-yellow-400">{settings.frequencyMax.toFixed(1)} Hz</span>
              </div>
              <p className="text-xs text-zinc-600">Upper bound of safe operational band</p>
            </div>
          </div>

          {/* Visual representation */}
          <div className="mt-4 p-4 bg-zinc-800/30 rounded-lg">
            <div className="text-xs text-zinc-500 mb-2">Safe Band Visualization</div>
            <div className="h-8 bg-gradient-to-r from-red-500 via-emerald-500 to-red-500 rounded relative">
              <div 
                className="absolute top-0 h-full bg-emerald-500/30 border-x-2 border-emerald-400"
                style={{
                  left: `${((settings.frequencyMin - 48) / 4) * 100}%`,
                  width: `${((settings.frequencyMax - settings.frequencyMin) / 4) * 100}%`
                }}
              />
              <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-xs font-mono text-white">
                Safe Band: {settings.frequencyMin.toFixed(1)} - {settings.frequencyMax.toFixed(1)} Hz
              </div>
            </div>
          </div>
        </div>

        {/* THD Settings */}
        <div className="bg-[#111827] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-zinc-300">Total Harmonic Distortion (THD)</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">THD Warning Threshold (%)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={3}
                max={15}
                value={settings.thdThreshold}
                onChange={(e) => setSettings(s => ({ ...s, thdThreshold: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className={`w-16 text-right font-mono ${settings.thdThreshold > 8 ? 'text-red-400' : 'text-yellow-400'}`}>
                {settings.thdThreshold}%
              </span>
            </div>
            <p className="text-xs text-zinc-600">Alert triggered when THD exceeds this value</p>
          </div>
        </div>

        {/* Neutral Current Settings */}
        <div className="bg-[#111827] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-zinc-300">Neutral Current</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Neutral Current Threshold (A)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={5}
                max={40}
                value={settings.neutralCurrentThreshold}
                onChange={(e) => setSettings(s => ({ ...s, neutralCurrentThreshold: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className="w-16 text-right font-mono text-purple-400">{settings.neutralCurrentThreshold}A</span>
            </div>
            <p className="text-xs text-zinc-600">Alert triggered when neutral current exceeds this value</p>
          </div>
        </div>

        {/* Phase Imbalance Settings */}
        <div className="bg-[#111827] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-zinc-300">Phase Imbalance</h2>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Phase Imbalance Threshold (%)</label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={10}
                max={50}
                value={settings.phaseImbalanceThreshold}
                onChange={(e) => setSettings(s => ({ ...s, phaseImbalanceThreshold: Number(e.target.value) }))}
                className="flex-1"
              />
              <span className={`w-16 text-right font-mono ${
                settings.phaseImbalanceThreshold > 30 ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {settings.phaseImbalanceThreshold}%
              </span>
            </div>
            <p className="text-xs text-zinc-600">Alert triggered when phase imbalance exceeds this value</p>
          </div>
        </div>

        {/* Transformer Settings */}
        <div className="bg-[#111827] rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-zinc-300">Transformer Limits</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Loading Threshold (%)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={50}
                  max={120}
                  value={settings.transformerLoadingThreshold}
                  onChange={(e) => setSettings(s => ({ ...s, transformerLoadingThreshold: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className={`w-16 text-right font-mono ${
                  settings.transformerLoadingThreshold > 80 ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {settings.transformerLoadingThreshold}%
                </span>
              </div>
              <p className="text-xs text-zinc-600">Alert triggered when loading exceeds this value</p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Temperature Threshold (°C)</label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={60}
                  max={110}
                  value={settings.temperatureThreshold}
                  onChange={(e) => setSettings(s => ({ ...s, temperatureThreshold: Number(e.target.value) }))}
                  className="flex-1"
                />
                <span className="w-16 text-right font-mono text-orange-400">{settings.temperatureThreshold}°C</span>
              </div>
              <p className="text-xs text-zinc-600">Alert triggered when temperature exceeds this value</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-[#111827] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-zinc-300 mb-4">Settings Summary</h2>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="text-zinc-500 mb-1">Voltage</div>
              <div className="font-mono text-emerald-400">{settings.voltageMin}V - {settings.voltageMax}V</div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="text-zinc-500 mb-1">Frequency</div>
              <div className="font-mono text-blue-400">{settings.frequencyMin.toFixed(1)} - {settings.frequencyMax.toFixed(1)} Hz</div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="text-zinc-500 mb-1">THD</div>
              <div className="font-mono text-purple-400">&lt; {settings.thdThreshold}%</div>
            </div>
            <div className="bg-zinc-800/30 rounded-lg p-3">
              <div className="text-zinc-500 mb-1">Imbalance</div>
              <div className="font-mono text-orange-400">&lt; {settings.phaseImbalanceThreshold}%</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
