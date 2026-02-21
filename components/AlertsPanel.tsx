'use client';

import { Alert } from '@/lib/simulation';
import { AlertTriangle, AlertCircle, Info, Bell } from 'lucide-react';

interface AlertsPanelProps {
  alerts: Alert[];
}

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getAlertBorder = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return 'border-l-red-500';
      case 'WARNING':
        return 'border-l-yellow-500';
      default:
        return 'border-l-blue-500';
    }
  };

  const getAlertBg = (type: string) => {
    switch (type) {
      case 'CRITICAL':
        return 'bg-red-500/10';
      case 'WARNING':
        return 'bg-yellow-500/10';
      default:
        return 'bg-blue-500/10';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  // Count alerts by type
  const criticalCount = alerts.filter(a => a.type === 'CRITICAL').length;
  const warningCount = alerts.filter(a => a.type === 'WARNING').length;
  const infoCount = alerts.filter(a => a.type === 'INFO').length;

  return (
    <div className="h-full flex flex-col">
      {/* Header with counts */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-semibold text-zinc-300">IoT Alerts</span>
        </div>
        <div className="flex gap-2 text-xs">
          {criticalCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-mono">
              {criticalCount} CRIT
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 font-mono">
              {warningCount} WARN
            </span>
          )}
          {infoCount > 0 && (
            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
              {infoCount} INFO
            </span>
          )}
        </div>
      </div>

      {/* Alert List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px]">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No alerts</p>
            <p className="text-xs">System operating normally</p>
          </div>
        ) : (
          alerts.slice(0, 50).map((alert, idx) => (
            <div
              key={`${alert.id}-${idx}`}
              className={`p-2 rounded border-l-4 ${getAlertBorder(alert.type)} ${getAlertBg(alert.type)} transition-all hover:bg-opacity-20`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-zinc-300 truncate">
                      {alert.source}
                    </span>
                    <span className="text-xs text-zinc-500 font-mono whitespace-nowrap">
                      {formatTime(alert.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary footer */}
      {alerts.length > 0 && (
        <div className="pt-2 mt-2 border-t border-zinc-700 text-xs text-zinc-500 text-center">
          Showing {Math.min(50, alerts.length)} of {alerts.length} alerts
        </div>
      )}
    </div>
  );
}
