// Export utilities for PDF and CSV reports
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  SimulationState, 
  PredictionData, 
  PhaseData, 
  HistoryRecord
} from './simulation';

export const exportToCSV = (state: SimulationState): void => {
  const headers = [
    'Timestamp',
    'Phase',
    'Voltage (V)',
    'Current (A)',
    'Power Factor',
    'Active Power (W)',
    'Reactive Power (kVAR)',
    'Apparent Power (kVA)',
    'THD (%)',
  ];

  const rows: string[][] = [];
  const timestamp = new Date().toISOString();

  const phaseDataMap: Record<string, PhaseData> = {
    A: state.phaseA,
    B: state.phaseB,
    C: state.phaseC,
  };

  ['A', 'B', 'C'].forEach((phase) => {
    const phaseData = phaseDataMap[phase];
    rows.push([
      timestamp,
      phase,
      phaseData.voltage.toString(),
      phaseData.current.toString(),
      phaseData.powerFactor.toString(),
      phaseData.power.toString(),
      phaseData.reactivePower.toString(),
      phaseData.apparentPower.toString(),
      phaseData.thd.toString(),
    ]);
  });

  rows.push([timestamp, 'Neutral', '', '', '', '', '', state.neutralCurrent.toString(), '']);
  rows.push([timestamp, 'Frequency', '', '', '', '', '', '', state.frequency.toString() + ' Hz']);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    '',
    '--- Summary ---',
    `Total Houses,${state.houses.length}`,
    `Total Solar Generation (kW),${state.totalSolarGeneration}`,
    `Total Load (kW),${state.totalLoad}`,
    `Phase Imbalance (%),${state.phaseImbalance}`,
    `Frequency (Hz),${state.frequency}`,
    `Reverse Power Flow,${state.reversePowerFlow ? 'Yes' : 'No'}`,
    '',
    '--- Transformer Status ---',
    `Temperature (°C),${state.transformerStatus.temperature}`,
    `Loading (%),${state.transformerStatus.loadingPercent}`,
    `Health Score,${state.transformerStatus.healthScore}`,
    `Operational State,${state.transformerStatus.operationalState}`,
    `Copper Loss (kW),${state.transformerStatus.copperLoss}`,
    `Core Loss (kW),${state.transformerStatus.coreLoss}`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `smartgrid_report_${Date.now()}.csv`;
  link.click();
};

export const exportHistoryToCSV = (history: HistoryRecord[]): void => {
  const headers = [
    'Timestamp',
    'Phase',
    'Voltage (V)',
    'Current (A)',
    'Power Factor',
    'Active Power (W)',
    'THD (%)',
    'Neutral Current (A)',
    'Frequency (Hz)',
    'Phase Imbalance (%)',
    'Transformer Load (%)',
    'Transformer Temp (°C)',
    'Total Solar (kW)',
    'Total Load (kW)',
  ];

  const rows: string[][] = [];
  const timestamp = new Date().toISOString();

  history.forEach((record) => {
    ['A', 'B', 'C'].forEach((phase) => {
      const phaseData = phase === 'A' ? record.phaseA : phase === 'B' ? record.phaseB : record.phaseC;
      rows.push([
        record.timestamp instanceof Date ? record.timestamp.toISOString() : timestamp,
        phase,
        phaseData.voltage.toString(),
        phaseData.current.toString(),
        phaseData.powerFactor.toString(),
        phaseData.power.toString(),
        phaseData.thd.toString(),
        record.neutralCurrent.toString(),
        record.frequency.toString(),
        record.phaseImbalance.toString(),
        record.transformerStatus.loadingPercent.toString(),
        record.transformerStatus.temperature.toString(),
        record.totalSolarGeneration.toString(),
        record.totalLoad.toString(),
      ]);
    });
  });

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `smartgrid_history_${Date.now()}.csv`;
  link.click();
};

export const exportToPDF = (state: SimulationState, predictions: PredictionData[]): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(24);
  doc.setTextColor(16, 185, 129);
  doc.text('Smart Grid Simulation Report', pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });

  // Phase Data Table
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Phase Measurements', 14, 45);

  const phaseData = [
    ['Phase A', state.phaseA.voltage.toString(), state.phaseA.current.toString(), 
     state.phaseA.powerFactor.toString(), (state.phaseA.power / 1000).toFixed(2) + ' kW', state.phaseA.thd.toString() + '%'],
    ['Phase B', state.phaseB.voltage.toString(), state.phaseB.current.toString(),
     state.phaseB.powerFactor.toString(), (state.phaseB.power / 1000).toFixed(2) + ' kW', state.phaseB.thd.toString() + '%'],
    ['Phase C', state.phaseC.voltage.toString(), state.phaseC.current.toString(),
     state.phaseC.powerFactor.toString(), (state.phaseC.power / 1000).toFixed(2) + ' kW', state.phaseC.thd.toString() + '%'],
    ['Neutral', '-', state.neutralCurrent.toString() + ' A', '-', '-', '-'],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Phase', 'Voltage (V)', 'Current (A)', 'Power Factor', 'Power', 'THD']],
    body: phaseData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
  });

  // System Summary
  const summaryY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('System Summary', 14, summaryY);

  const summaryData = [
    ['Total Houses', state.houses.length.toString()],
    ['Total Solar Generation', `${state.totalSolarGeneration} kW`],
    ['Total Load', `${state.totalLoad} kW`],
    ['Phase Imbalance', `${state.phaseImbalance}%`],
    ['Frequency', `${state.frequency} Hz`],
    ['Reverse Power Flow', state.reversePowerFlow ? 'Yes' : 'No'],
    ['Simulation Time', `${Math.floor(state.time / 3600)}h ${Math.floor((state.time % 3600) / 60)}m`],
  ];

  autoTable(doc, {
    startY: summaryY + 5,
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 11 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  // Transformer Status
  const xfmrY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Transformer Status', 14, xfmrY);

  const xfmrData = [
    ['Temperature', `${state.transformerStatus.temperature}°C`],
    ['Loading', `${state.transformerStatus.loadingPercent}%`],
    ['Health Score', `${state.transformerStatus.healthScore}%`],
    ['Operational State', state.transformerStatus.operationalState],
    ['Copper Loss', `${state.transformerStatus.copperLoss} kW`],
    ['Core Loss', `${state.transformerStatus.coreLoss} kW`],
  ];

  autoTable(doc, {
    startY: xfmrY + 5,
    body: xfmrData,
    theme: 'plain',
    styles: { fontSize: 11 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  // Alerts Summary
  const alertsY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Recent Alerts', 14, alertsY);

  const alertData = state.alerts.slice(0, 10).map(alert => [
    alert.type,
    alert.source,
    alert.message.substring(0, 40) + (alert.message.length > 40 ? '...' : ''),
    alert.timestamp instanceof Date ? alert.timestamp.toLocaleTimeString() : '',
  ]);

  if (alertData.length > 0) {
    autoTable(doc, {
      startY: alertsY + 5,
      head: [['Type', 'Source', 'Message', 'Time']],
      body: alertData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68] },
    });
  }

  // Predictions Summary
  const predY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Prediction Summary (Next 24h)', 14, predY);

  const predSummary = [
    ['Max Predicted Load', `${Math.max(...predictions.map(p => p.load))} kW`],
    ['Max Predicted Solar', `${Math.max(...predictions.map(p => p.solar))} kW`],
    ['Avg Phase Imbalance', `${(predictions.reduce((s, p) => s + p.imbalance, 0) / predictions.length).toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: predY + 5,
    body: predSummary,
    theme: 'plain',
    styles: { fontSize: 11 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  // AI Analysis Section
  if (state.aiAnalysis) {
    const aiY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('AI Analysis & Risk Assessment', 14, aiY);

    const aiData = [
      ['Phase Imbalance Risk', `${state.aiAnalysis.phaseImbalanceRisk}%`],
      ['Overload Probability', `${state.aiAnalysis.overloadProbability}%`],
      ['Voltage Instability Risk', `${state.aiAnalysis.voltageInstabilityRisk}%`],
      ['Harmonic Growth Rate', `${state.aiAnalysis.harmonicGrowthRate}%/h`],
      ['Transformer Failure Risk', `${state.aiAnalysis.transformerFailureRisk}%`],
    ];

    autoTable(doc, {
      startY: aiY + 5,
      body: aiData,
      theme: 'plain',
      styles: { fontSize: 11 },
      columnStyles: { 0: { fontStyle: 'bold' } },
    });
  }

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    'Smart Grid Simulation Dashboard - Research Edition',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`smartgrid_report_${Date.now()}.pdf`);
};

export const exportHistoryToPDF = (history: HistoryRecord[]): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(24);
  doc.setTextColor(16, 185, 129);
  doc.text('Smart Grid History Report', pageWidth / 2, 20, { align: 'center' });

  // Subtitle
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 30, { align: 'center' });
  doc.text(`Total Records: ${history.length}`, pageWidth / 2, 38, { align: 'center' });

  if (history.length === 0) {
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('No history records available', pageWidth / 2, 60, { align: 'center' });
    doc.save(`smartgrid_history_${Date.now()}.pdf`);
    return;
  }

  // Summary statistics
  const avgVoltage = (history.reduce((s, r) => s + (r.phaseA.voltage + r.phaseB.voltage + r.phaseC.voltage) / 3, 0) / history.length).toFixed(1);
  const avgTHD = (history.reduce((s, r) => s + (r.phaseA.thd + r.phaseB.thd + r.phaseC.thd) / 3, 0) / history.length).toFixed(1);
  const maxLoad = Math.max(...history.map(r => r.totalLoad)).toFixed(1);
  const maxSolar = Math.max(...history.map(r => r.totalSolarGeneration)).toFixed(1);
  const avgImbalance = (history.reduce((s, r) => s + r.phaseImbalance, 0) / history.length).toFixed(1);

  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Historical Summary', 14, 55);

  const summaryData = [
    ['Average Voltage', `${avgVoltage} V`],
    ['Average THD', `${avgTHD}%`],
    ['Maximum Load', `${maxLoad} kW`],
    ['Maximum Solar', `${maxSolar} kW`],
    ['Average Phase Imbalance', `${avgImbalance}%`],
  ];

  autoTable(doc, {
    startY: 60,
    body: summaryData,
    theme: 'plain',
    styles: { fontSize: 11 },
    columnStyles: { 0: { fontStyle: 'bold' } },
  });

  // Recent records
  const recentRecords = history.slice(-20);
  const recordData = recentRecords.map(r => [
    r.timestamp instanceof Date ? r.timestamp.toLocaleTimeString() : '',
    `${r.phaseA.voltage.toFixed(0)}/${r.phaseB.voltage.toFixed(0)}/${r.phaseC.voltage.toFixed(0)}`,
    `${r.totalLoad.toFixed(1)} kW`,
    `${r.totalSolarGeneration.toFixed(1)} kW`,
    `${r.phaseImbalance.toFixed(1)}%`,
    `${r.transformerStatus.loadingPercent.toFixed(0)}%`,
  ]);

  const recordsY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text('Recent Records (Last 20)', 14, recordsY);

  autoTable(doc, {
    startY: recordsY + 5,
    head: [['Time', 'Voltage (A/B/C)', 'Load', 'Solar', 'Imbalance', 'Xfmr Load']],
    body: recordData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 },
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    'Smart Grid Simulation Dashboard - Research Edition',
    pageWidth / 2,
    doc.internal.pageSize.getHeight() - 10,
    { align: 'center' }
  );

  doc.save(`smartgrid_history_${Date.now()}.pdf`);
};
