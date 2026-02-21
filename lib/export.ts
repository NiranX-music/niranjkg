// Export utilities for PDF and CSV reports
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SimulationState, PredictionData, PhaseData } from './simulation';

export const exportToCSV = (state: SimulationState): void => {
  const headers = [
    'Timestamp',
    'Phase',
    'Voltage (V)',
    'Current (A)',
    'Power Factor',
    'Power (W)',
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
      phaseData.thd.toString(),
    ]);
  });

  rows.push([timestamp, 'Neutral', '', '', '', '', state.neutralCurrent.toString()]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
    '',
    '--- Summary ---',
    `Total Houses,${state.houses.length}`,
    `Total Solar Generation (kW),${state.totalSolarGeneration}`,
    `Total Load (kW),${state.totalLoad}`,
    `Phase Imbalance (%),${state.phaseImbalance}`,
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `smartgrid_report_${Date.now()}.csv`;
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
     state.phaseA.powerFactor.toString(), state.phaseA.power.toString(), state.phaseA.thd.toString()],
    ['Phase B', state.phaseB.voltage.toString(), state.phaseB.current.toString(),
     state.phaseB.powerFactor.toString(), state.phaseB.power.toString(), state.phaseB.thd.toString()],
    ['Phase C', state.phaseC.voltage.toString(), state.phaseC.current.toString(),
     state.phaseC.powerFactor.toString(), state.phaseC.power.toString(), state.phaseC.thd.toString()],
    ['Neutral', '-', state.neutralCurrent.toString(), '-', '-', '-'],
  ];

  autoTable(doc, {
    startY: 50,
    head: [['Phase', 'Voltage (V)', 'Current (A)', 'Power Factor', 'Power (W)', 'THD (%)']],
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
    ['Simulation Time', `${Math.floor(state.time / 3600)}h ${Math.floor((state.time % 3600) / 60)}m`],
  ];

  autoTable(doc, {
    startY: summaryY + 5,
    body: summaryData,
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
    alert.timestamp.toLocaleTimeString(),
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
