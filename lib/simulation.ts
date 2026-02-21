// Smart Grid Simulation Engine - Enhanced Version
// Research-level 3-phase distribution transformer simulation

export interface PhaseData {
  voltage: number;
  current: number;
  powerFactor: number;
  power: number;
  reactivePower: number; // Q in kVAR
  apparentPower: number; // S in kVA
  thd: number;
  harmonicSpectrum: HarmonicComponent[];
}

export interface HarmonicComponent {
  order: number;
  percentage: number;
}

export interface HouseData {
  id: number;
  phase: 'A' | 'B' | 'C';
  solarOutput: number;
  temperature: number;
  panelEfficiency: number;
  inverterVoltVAREnabled: boolean;
  inverterVoltWattEnabled: boolean;
  load: number;
  isActive: boolean;
  hasSmartInverter: boolean;
}

export interface Alert {
  id: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: Date;
  source: string;
  message: string;
}

export interface TransformerStatus {
  temperature: number;
  loadingPercent: number;
  healthScore: number;
  operationalState: 'NORMAL' | 'WARNING' | 'OVERLOADED' | 'CRITICAL';
  copperLoss: number; // kW
  coreLoss: number; // kW
}

export interface SensorData {
  id: string;
  type: 'energy_meter' | 'transformer_temp' | 'neutral_current' | 'harmonic_analyzer' | 'feeder_impedance';
  name: string;
  connected: boolean;
  lastReading: number;
  unit: string;
  timestamp: Date;
}

export interface AIAnalysis {
  id: string;
  timestamp: Date;
  phaseImbalanceRisk: number;
  overloadProbability: number;
  voltageInstabilityRisk: number;
  harmonicGrowthRate: number;
  transformerFailureRisk: number;
  recommendations: AIRecommendation[];
}

export interface AIRecommendation {
  id: string;
  type: 'phase_reallocation' | 'reactive_compensation' | 'solar_curtailment' | 'balance_converter';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  expectedImprovement: string;
}

export interface SimulationState {
  isRunning: boolean;
  speed: number;
  time: number;
  frequency: number;
  phaseA: PhaseData;
  phaseB: PhaseData;
  phaseC: PhaseData;
  neutralCurrent: number;
  houses: HouseData[];
  totalSolarGeneration: number;
  totalLoad: number;
  phaseImbalance: number;
  alerts: Alert[];
  transformerStatus: TransformerStatus;
  sensors: SensorData[];
  aiAnalysis: AIAnalysis | null;
  reversePowerFlow: boolean;
  cloudCover: number;
}

export interface PredictionData {
  time: number;
  load: number;
  solar: number;
  imbalance: number;
}

export interface HistoryRecord {
  id: string;
  timestamp: Date;
  phaseA: PhaseData;
  phaseB: PhaseData;
  phaseC: PhaseData;
  neutralCurrent: number;
  frequency: number;
  transformerStatus: TransformerStatus;
  phaseImbalance: number;
  totalSolarGeneration: number;
  totalLoad: number;
  aiAnalysis: AIAnalysis | null;
}

export interface GlobalSettings {
  voltageMin: number;
  voltageMax: number;
  frequencyMin: number;
  frequencyMax: number;
  thdThreshold: number;
  neutralCurrentThreshold: number;
  phaseImbalanceThreshold: number;
  transformerLoadingThreshold: number;
  temperatureThreshold: number;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  voltageMin: 220,
  voltageMax: 250,
  frequencyMin: 49.5,
  frequencyMax: 50.5,
  thdThreshold: 8,
  neutralCurrentThreshold: 20,
  phaseImbalanceThreshold: 30,
  transformerLoadingThreshold: 80,
  temperatureThreshold: 90,
};

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy';
export type LoadProfile = 'residential' | 'industrial';
export type SimulationMode = 'running' | 'paused' | 'stopped';

const BASE_VOLTAGE = 240; // Line-to-neutral
const BASE_FREQUENCY = 50; // Hz
const IMPEDANCE_R = 0.05; // Ohms per unit length
const IMPEDANCE_X = 0.08; // Reactance per unit length

// Generate random value within range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate harmonic spectrum based on loads and solar
const generateHarmonicSpectrum = (solarOutput: number, load: number, industrialMode: boolean): HarmonicComponent[] => {
  const base3rd = industrialMode ? 8 : 3;
  const base5th = industrialMode ? 6 : 2.5;
  const base7th = industrialMode ? 4 : 1.5;
  
  const solarImpact = solarOutput * 0.5;
  
  return [
    { order: 3, percentage: Math.min(15, base3rd + solarImpact + randomInRange(0, 2)) },
    { order: 5, percentage: Math.min(12, base5th + solarImpact * 0.8 + randomInRange(0, 1.5)) },
    { order: 7, percentage: Math.min(8, base7th + solarImpact * 0.6 + randomInRange(0, 1)) },
  ];
};

// Calculate THD from harmonic spectrum
const calculateTHD = (spectrum: HarmonicComponent[]): number => {
  const sumSquares = spectrum.reduce((sum, h) => sum + Math.pow(h.percentage / 100, 2), 0);
  return Math.sqrt(sumSquares) * 100;
};

// Generate houses with enhanced properties
export const generateHouses = (count: number, weather: WeatherCondition): HouseData[] => {
  const houses: HouseData[] = [];
  const phases: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  
  for (let i = 0; i < count; i++) {
    const phase = phases[i % 3];
    const baseSolar = weather === 'sunny' ? 5 : weather === 'cloudy' ? 2.5 : 0.8;
    const temperature = weather === 'sunny' ? 25 : weather === 'cloudy' ? 18 : 12;
    const solarOutput = randomInRange(0, baseSolar);
    
    // Temperature affects panel efficiency (typically 0.4% per degree above 25°C)
    const panelEfficiency = Math.max(0.7, 1 - (temperature - 25) * 0.004);
    
    houses.push({
      id: i + 1,
      phase,
      solarOutput: solarOutput * panelEfficiency,
      temperature,
      panelEfficiency: Math.round(panelEfficiency * 100) / 100,
      inverterVoltVAREnabled: Math.random() > 0.3,
      inverterVoltWattEnabled: Math.random() > 0.5,
      load: randomInRange(0.5, 2.5),
      isActive: Math.random() > 0.1,
      hasSmartInverter: Math.random() > 0.4,
    });
  }
  
  return houses;
};

// Calculate phase data with enhanced electrical calculations
export const calculatePhaseData = (
  houses: HouseData[],
  phase: 'A' | 'B' | 'C',
  time: number,
  industrialMode: boolean,
  cloudCover: number = 0
): PhaseData => {
  const phaseHouses = houses.filter(h => h.phase === phase && h.isActive);
  
  let totalLoad = phaseHouses.reduce((sum, h) => sum + h.load, 0);
  let totalSolar = phaseHouses.reduce((sum, h) => sum + h.solarOutput, 0);
  
  // Time-based variation (simulate day/night cycle)
  const hourOfDay = (time / 3600) % 24;
  const solarMultiplier = hourOfDay >= 6 && hourOfDay <= 18 
    ? Math.sin((hourOfDay - 6) * Math.PI / 12) 
    : 0;
  
  // Cloud cover affects solar output
  const cloudFactor = 1 - (cloudCover / 100) * 0.7;
  totalSolar *= solarMultiplier * cloudFactor;
  
  // Industrial mode adds significant base load
  if (industrialMode) {
    totalLoad += randomInRange(20, 40);
  }
  
  // Net current (load - solar)
  const netCurrent = Math.max(0, totalLoad - totalSolar * 0.8);
  
  // Power factor calculation - affected by inductive loads and solar inverters
  let powerFactor = randomInRange(0.75, 0.95);
  if (industrialMode) {
    powerFactor = randomInRange(0.65, 0.85);
  }
  
  // Calculate P, Q, S
  const activePower = BASE_VOLTAGE * netCurrent * powerFactor / 1000; // kW
  const apparentPower = BASE_VOLTAGE * netCurrent / 1000; // kVA
  const reactivePower = Math.sqrt(Math.max(0, Math.pow(apparentPower, 2) - Math.pow(activePower, 2))); // kVAR
  
  // Harmonic spectrum based on solar and load
  const harmonicSpectrum = generateHarmonicSpectrum(totalSolar, totalLoad, industrialMode);
  const thd = calculateTHD(harmonicSpectrum);
  
  // Voltage drop via impedance matrix (R + jX)
  const impedanceZ = Math.sqrt(Math.pow(IMPEDANCE_R, 2) + Math.pow(IMPEDANCE_X, 2));
  const voltageDrop = netCurrent * impedanceZ * 0.5;
  const voltage = BASE_VOLTAGE - voltageDrop + randomInRange(-2, 2);
  
  return {
    voltage: Math.round(voltage * 10) / 10,
    current: Math.round(netCurrent * 10) / 10,
    powerFactor: Math.round(powerFactor * 100) / 100,
    power: Math.round(BASE_VOLTAGE * netCurrent * powerFactor),
    reactivePower: Math.round(reactivePower * 10) / 10,
    apparentPower: Math.round(apparentPower * 10) / 10,
    thd: Math.round(thd * 10) / 10,
    harmonicSpectrum,
  };
};

// Calculate neutral current (unbalance indicator)
export const calculateNeutralCurrent = (phaseA: PhaseData, phaseB: PhaseData, phaseC: PhaseData): number => {
  // Vector sum of phase currents (simplified for simulation)
  const currents = [phaseA.current, phaseB.current, phaseC.current];
  const angles = [0, -120, 120]; // Phase angles
  
  let neutralX = 0;
  let neutralY = 0;
  
  currents.forEach((current, idx) => {
    const angle = (angles[idx] * Math.PI) / 180;
    neutralX += current * Math.cos(angle);
    neutralY += current * Math.sin(angle);
  });
  
  const neutralCurrent = Math.sqrt(Math.pow(neutralX, 2) + Math.pow(neutralY, 2)) * 0.3 + randomInRange(0, 2);
  
  return Math.round(neutralCurrent * 10) / 10;
};

// Calculate phase imbalance percentage
export const calculatePhaseImbalance = (phaseA: PhaseData, phaseB: PhaseData, phaseC: PhaseData): number => {
  const currents = [phaseA.current, phaseB.current, phaseC.current];
  const avgCurrent = currents.reduce((a, b) => a + b, 0) / 3;
  
  if (avgCurrent === 0) return 0;
  
  const imbalance = (Math.max(...currents) - Math.min(...currents)) / avgCurrent * 100;
  return Math.round(imbalance * 10) / 10;
};

// Calculate transformer status
export const calculateTransformerStatus = (
  phaseA: PhaseData,
  phaseB: PhaseData,
  phaseC: PhaseData,
  totalLoad: number
): TransformerStatus => {
  // Calculate total apparent power
  const totalS = (phaseA.apparentPower + phaseB.apparentPower + phaseC.apparentPower);
  const loadingPercent = Math.min(150, (totalS / 100) * 100); // Assume 100 kVA transformer rating
  
  // Temperature based on loading
  const baseTemp = 45;
  const tempIncrease = (loadingPercent / 100) * 45;
  const temperature = baseTemp + tempIncrease + randomInRange(-5, 5);
  
  // Health score decreases with temperature and loading
  let healthScore = 100;
  if (temperature > 80) healthScore -= (temperature - 80) * 2;
  if (loadingPercent > 80) healthScore -= (loadingPercent - 80) * 0.5;
  healthScore = Math.max(0, Math.round(healthScore));
  
  // Operational state
  let operationalState: TransformerStatus['operationalState'] = 'NORMAL';
  if (healthScore < 40 || temperature > 95 || loadingPercent > 100) {
    operationalState = 'CRITICAL';
  } else if (healthScore < 60 || temperature > 85 || loadingPercent > 80) {
    operationalState = 'OVERLOADED';
  } else if (healthScore < 80 || temperature > 70) {
    operationalState = 'WARNING';
  }
  
  // Copper loss (I²R) - proportional to load squared
  const copperLoss = Math.pow(loadingPercent / 100, 2) * 2; // kW
  // Core loss - relatively constant
  const coreLoss = 0.5 + randomInRange(0, 0.2); // kW
  
  return {
    temperature: Math.round(temperature * 10) / 10,
    loadingPercent: Math.round(loadingPercent * 10) / 10,
    healthScore,
    operationalState,
    copperLoss: Math.round(copperLoss * 100) / 100,
    coreLoss: Math.round(coreLoss * 100) / 100,
  };
};

// Generate frequency with safe band visualization
export const calculateFrequency = (load: number, solar: number): number => {
  // Frequency deviation based on load/solar balance
  const baseDeviation = (load - solar) * 0.01;
  const frequency = BASE_FREQUENCY + baseDeviation + randomInRange(-0.05, 0.05);
  return Math.round(frequency * 100) / 100;
};

// AI Phase Balancer simulation
export const applyPhaseBalancing = (
  phaseA: PhaseData,
  phaseB: PhaseData,
  phaseC: PhaseData,
  enabled: boolean
): { phaseA: PhaseData; phaseB: PhaseData; phaseC: PhaseData } => {
  if (!enabled) {
    return { phaseA, phaseB, phaseC };
  }
  
  const currents = [phaseA.current, phaseB.current, phaseC.current];
  const avgCurrent = currents.reduce((a, b) => a + b, 0) / 3;
  
  // AI balancer redistributes current to achieve balance
  const balancedCurrents = currents.map(c => avgCurrent + (c - avgCurrent) * 0.1);
  
  // Recalculate power values
  const recalcPower = (phase: PhaseData, newCurrent: number): PhaseData => {
    const newPower = BASE_VOLTAGE * newCurrent * phase.powerFactor;
    const newReactivePower = Math.sqrt(Math.pow(BASE_VOLTAGE * newCurrent / 1000, 2) - Math.pow(newPower / 1000, 2));
    return {
      ...phase,
      current: Math.round(newCurrent * 10) / 10,
      power: Math.round(newPower),
      reactivePower: Math.round(newReactivePower * 10) / 10,
      apparentPower: Math.round(BASE_VOLTAGE * newCurrent / 1000 * 10) / 10,
    };
  };
  
  return {
    phaseA: recalcPower(phaseA, balancedCurrents[0]),
    phaseB: recalcPower(phaseB, balancedCurrents[1]),
    phaseC: recalcPower(phaseC, balancedCurrents[2]),
  };
};

// Generate AI analysis
export const generateAIAnalysis = (
  phaseA: PhaseData,
  phaseB: PhaseData,
  phaseC: PhaseData,
  neutralCurrent: number,
  transformerStatus: TransformerStatus,
  phaseImbalance: number,
  frequency: number
): AIAnalysis => {
  // Phase imbalance risk (0-100)
  const phaseImbalanceRisk = Math.min(100, phaseImbalance * 3);
  
  // Overload probability based on transformer loading
  const overloadProbability = Math.min(100, Math.max(0, transformerStatus.loadingPercent - 50) * 2);
  
  // Voltage instability risk based on THD and voltage variations
  const avgTHD = (phaseA.thd + phaseB.thd + phaseC.thd) / 3;
  const voltageVariation = Math.abs(phaseA.voltage - phaseB.voltage) + Math.abs(phaseB.voltage - phaseC.voltage);
  const voltageInstabilityRisk = Math.min(100, (avgTHD * 5) + (voltageVariation * 0.5));
  
  // Harmonic growth rate (simulated trend)
  const harmonicGrowthRate = avgTHD > 5 ? randomInRange(2, 8) : randomInRange(-2, 2);
  
  // Transformer failure risk based on health and loading
  const transformerFailureRisk = Math.min(100, 
    (100 - transformerStatus.healthScore) * 0.7 + 
    (transformerStatus.temperature > 80 ? 20 : 0) +
    (transformerStatus.loadingPercent > 80 ? 15 : 0)
  );
  
  // Generate recommendations based on analysis
  const recommendations: AIRecommendation[] = [];
  
  if (phaseImbalance > 15) {
    recommendations.push({
      id: `rec-${Date.now()}-1`,
      type: 'phase_reallocation',
      priority: phaseImbalance > 30 ? 'HIGH' : 'MEDIUM',
      description: 'Redistribute high-load houses across phases to reduce imbalance',
      expectedImprovement: `Reduce phase imbalance by ${Math.round(phaseImbalance * 0.4)}%`,
    });
  }
  
  if (overloadProbability > 30) {
    recommendations.push({
      id: `rec-${Date.now()}-2`,
      type: 'reactive_compensation',
      priority: overloadProbability > 60 ? 'HIGH' : 'MEDIUM',
      description: 'Activate reactive power compensation to reduce apparent power',
      expectedImprovement: `Reduce transformer loading by ${Math.round(overloadProbability * 0.2)}%`,
    });
  }
  
  if (avgTHD > 5) {
    recommendations.push({
      id: `rec-${Date.now()}-3`,
      type: 'solar_curtailment',
      priority: avgTHD > 8 ? 'HIGH' : 'LOW',
      description: 'Consider solar curtailment or add harmonic filters',
      expectedImprovement: `Reduce THD by ${Math.round(avgTHD * 0.3)}%`,
    });
  }
  
  if (transformerFailureRisk > 40) {
    recommendations.push({
      id: `rec-${Date.now()}-4`,
      type: 'balance_converter',
      priority: 'HIGH',
      description: 'Activate phase balancing converter to reduce transformer stress',
      expectedImprovement: `Improve transformer health by ${Math.round((100 - transformerFailureRisk) * 0.3)}%`,
    });
  }
  
  return {
    id: `ai-${Date.now()}`,
    timestamp: new Date(),
    phaseImbalanceRisk: Math.round(phaseImbalanceRisk),
    overloadProbability: Math.round(overloadProbability),
    voltageInstabilityRisk: Math.round(voltageInstabilityRisk),
    harmonicGrowthRate: Math.round(harmonicGrowthRate * 10) / 10,
    transformerFailureRisk: Math.round(transformerFailureRisk),
    recommendations,
  };
};

// Generate sensors
export const generateSensors = (): SensorData[] => {
  return [
    { id: 'sensor-1', type: 'energy_meter', name: 'EM-A01 (Phase A)', connected: true, lastReading: 0, unit: 'kW', timestamp: new Date() },
    { id: 'sensor-2', type: 'energy_meter', name: 'EM-B01 (Phase B)', connected: true, lastReading: 0, unit: 'kW', timestamp: new Date() },
    { id: 'sensor-3', type: 'energy_meter', name: 'EM-C01 (Phase C)', connected: true, lastReading: 0, unit: 'kW', timestamp: new Date() },
    { id: 'sensor-4', type: 'transformer_temp', name: 'TT-01 (Transformer)', connected: true, lastReading: 0, unit: '°C', timestamp: new Date() },
    { id: 'sensor-5', type: 'neutral_current', name: 'NC-01 (Neutral)', connected: true, lastReading: 0, unit: 'A', timestamp: new Date() },
    { id: 'sensor-6', type: 'harmonic_analyzer', name: 'HA-01 (Main)', connected: true, lastReading: 0, unit: '%', timestamp: new Date() },
    { id: 'sensor-7', type: 'feeder_impedance', name: 'FI-01 (Feeder)', connected: Math.random() > 0.2, lastReading: 0, unit: 'Ω', timestamp: new Date() },
  ];
};

// Update sensor readings
export const updateSensorReadings = (
  sensors: SensorData[],
  phaseA: PhaseData,
  phaseB: PhaseData,
  phaseC: PhaseData,
  transformerStatus: TransformerStatus,
  neutralCurrent: number,
  frequency: number
): SensorData[] => {
  return sensors.map(sensor => {
    let reading = 0;
    
    switch (sensor.type) {
      case 'energy_meter':
        if (sensor.name.includes('A')) reading = phaseA.power / 1000;
        else if (sensor.name.includes('B')) reading = phaseB.power / 1000;
        else reading = phaseC.power / 1000;
        break;
      case 'transformer_temp':
        reading = transformerStatus.temperature;
        break;
      case 'neutral_current':
        reading = neutralCurrent;
        break;
      case 'harmonic_analyzer':
        reading = (phaseA.thd + phaseB.thd + phaseC.thd) / 3;
        break;
      case 'feeder_impedance':
        reading = Math.sqrt(Math.pow(IMPEDANCE_R, 2) + Math.pow(IMPEDANCE_X, 2));
        break;
    }
    
    return {
      ...sensor,
      lastReading: Math.round(reading * 100) / 100,
      timestamp: new Date(),
    };
  });
};

// Generate alerts based on system state with settings
export const generateAlerts = (
  phaseA: PhaseData,
  phaseB: PhaseData,
  phaseC: PhaseData,
  neutralCurrent: number,
  imbalance: number,
  frequency: number,
  transformerStatus: TransformerStatus,
  settings: GlobalSettings
): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  
  // Voltage alerts
  [phaseA, phaseB, phaseC].forEach((phase, index) => {
    const phaseName = ['A', 'B', 'C'][index];
    if (phase.voltage < settings.voltageMin) {
      alerts.push({
        id: `v-${now.getTime()}-${index}`,
        type: 'CRITICAL',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `Under-voltage: ${phase.voltage}V (threshold: ${settings.voltageMin}V)`,
      });
    } else if (phase.voltage < settings.voltageMin + 10) {
      alerts.push({
        id: `v-${now.getTime()}-${index}`,
        type: 'WARNING',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `Low voltage: ${phase.voltage}V`,
      });
    } else if (phase.voltage > settings.voltageMax) {
      alerts.push({
        id: `v-${now.getTime()}-${index}`,
        type: 'CRITICAL',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `Over-voltage: ${phase.voltage}V (threshold: ${settings.voltageMax}V)`,
      });
    }
  });
  
  // THD alerts
  [phaseA, phaseB, phaseC].forEach((phase, index) => {
    const phaseName = ['A', 'B', 'C'][index];
    if (phase.thd > settings.thdThreshold) {
      alerts.push({
        id: `thd-${now.getTime()}-${index}`,
        type: 'CRITICAL',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `High THD: ${phase.thd}% (threshold: ${settings.thdThreshold}%)`,
      });
    } else if (phase.thd > settings.thdThreshold * 0.625) {
      alerts.push({
        id: `thd-${now.getTime()}-${index}`,
        type: 'WARNING',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `Elevated THD: ${phase.thd}%`,
      });
    }
  });
  
  // Frequency alerts
  if (frequency < settings.frequencyMin) {
    alerts.push({
      id: `freq-${now.getTime()}`,
      type: 'CRITICAL',
      timestamp: now,
      source: 'System',
      message: `Under-frequency: ${frequency}Hz (threshold: ${settings.frequencyMin}Hz)`,
    });
  } else if (frequency > settings.frequencyMax) {
    alerts.push({
      id: `freq-${now.getTime()}`,
      type: 'CRITICAL',
      timestamp: now,
      source: 'System',
      message: `Over-frequency: ${frequency}Hz (threshold: ${settings.frequencyMax}Hz)`,
    });
  } else if (frequency < settings.frequencyMin + 0.3 || frequency > settings.frequencyMax - 0.3) {
    alerts.push({
      id: `freq-${now.getTime()}`,
      type: 'WARNING',
      timestamp: now,
      source: 'System',
      message: `Frequency deviation: ${frequency}Hz`,
    });
  }
  
  // Neutral current alerts
  if (neutralCurrent > settings.neutralCurrentThreshold) {
    alerts.push({
      id: `n-${now.getTime()}`,
      type: 'CRITICAL',
      timestamp: now,
      source: 'Neutral',
      message: `High neutral current: ${neutralCurrent}A (threshold: ${settings.neutralCurrentThreshold}A)`,
    });
  } else if (neutralCurrent > settings.neutralCurrentThreshold * 0.5) {
    alerts.push({
      id: `n-${now.getTime()}`,
      type: 'WARNING',
      timestamp: now,
      source: 'Neutral',
      message: `Elevated neutral current: ${neutralCurrent}A`,
    });
  }
  
  // Phase imbalance alerts
  if (imbalance > settings.phaseImbalanceThreshold) {
    alerts.push({
      id: `imb-${now.getTime()}`,
      type: 'CRITICAL',
      timestamp: now,
      source: 'System',
      message: `Severe phase imbalance: ${imbalance}% (threshold: ${settings.phaseImbalanceThreshold}%)`,
    });
  } else if (imbalance > settings.phaseImbalanceThreshold * 0.5) {
    alerts.push({
      id: `imb-${now.getTime()}`,
      type: 'WARNING',
      timestamp: now,
      source: 'System',
      message: `Phase imbalance detected: ${imbalance}%`,
    });
  }
  
  // Transformer alerts
  if (transformerStatus.operationalState === 'CRITICAL') {
    alerts.push({
      id: `xfmr-${now.getTime()}`,
      type: 'CRITICAL',
      timestamp: now,
      source: 'Transformer',
      message: `Critical transformer status: ${transformerStatus.operationalState} - Temp: ${transformerStatus.temperature}°C, Load: ${transformerStatus.loadingPercent}%`,
    });
  } else if (transformerStatus.operationalState === 'OVERLOADED') {
    alerts.push({
      id: `xfmr-${now.getTime()}`,
      type: 'WARNING',
      timestamp: now,
      source: 'Transformer',
      message: `Transformer overloaded: ${transformerStatus.loadingPercent}%`,
    });
  }
  
  return alerts;
};

// Generate prediction data (ML-style forecast)
export const generatePredictions = (
  currentState: SimulationState,
  hoursAhead: number = 24
): PredictionData[] => {
  const predictions: PredictionData[] = [];
  const currentTime = currentState.time;
  
  for (let i = 0; i < hoursAhead; i++) {
    const t = currentTime + i * 3600;
    const hourOfDay = (t / 3600) % 24;
    
    // Simple time-based predictions with noise
    const baseLoad = currentState.totalLoad * (1 + Math.sin(hourOfDay * Math.PI / 12) * 0.3);
    const load = baseLoad + randomInRange(-5, 5);
    
    const solarFactor = hourOfDay >= 6 && hourOfDay <= 18 
      ? Math.sin((hourOfDay - 6) * Math.PI / 12) 
      : 0;
    const solar = currentState.totalSolarGeneration * solarFactor + randomInRange(-1, 1);
    
    const imbalance = currentState.phaseImbalance * (0.8 + Math.random() * 0.4);
    
    predictions.push({
      time: t,
      load: Math.max(0, Math.round(load * 10) / 10),
      solar: Math.max(0, Math.round(solar * 10) / 10),
      imbalance: Math.round(imbalance * 10) / 10,
    });
  }
  
  return predictions;
};

// Check for reverse power flow (solar > load)
export const checkReversePowerFlow = (
  totalSolar: number,
  totalLoad: number
): boolean => {
  return totalSolar > totalLoad * 1.2;
};

// Update simulation state
export const updateSimulation = (
  state: SimulationState,
  config: {
    houseCount: number;
    weather: WeatherCondition;
    industrialMode: boolean;
    aiBalancerEnabled: boolean;
  },
  settings: GlobalSettings = DEFAULT_SETTINGS
): SimulationState => {
  const newTime = state.time + 1 * state.speed;
  
  // Cloud cover dynamics
  const cloudCover = state.cloudCover + randomInRange(-2, 2);
  const clampedCloud = Math.max(0, Math.min(100, cloudCover));
  
  // Regenerate house data periodically for variation
  const houses = newTime % 60 === 0 
    ? generateHouses(config.houseCount, config.weather)
    : state.houses.map(h => ({
        ...h,
        solarOutput: h.solarOutput * (0.95 + Math.random() * 0.1),
        load: h.load * (0.98 + Math.random() * 0.04),
      }));
  
  // Calculate phase data
  let phaseA = calculatePhaseData(houses, 'A', newTime, config.industrialMode, clampedCloud);
  let phaseB = calculatePhaseData(houses, 'B', newTime, config.industrialMode, clampedCloud);
  let phaseC = calculatePhaseData(houses, 'C', newTime, config.industrialMode, clampedCloud);
  
  // Apply AI balancer
  const balanced = applyPhaseBalancing(phaseA, phaseB, phaseC, config.aiBalancerEnabled);
  phaseA = balanced.phaseA;
  phaseB = balanced.phaseB;
  phaseC = balanced.phaseC;
  
  const neutralCurrent = calculateNeutralCurrent(phaseA, phaseB, phaseC);
  const imbalance = calculatePhaseImbalance(phaseA, phaseB, phaseC);
  
  // Calculate frequency
  const totalLoad = houses.reduce((sum, h) => sum + h.load, 0);
  const totalSolar = houses.reduce((sum, h) => sum + h.solarOutput, 0);
  const frequency = calculateFrequency(totalLoad, totalSolar);
  
  // Calculate transformer status
  const transformerStatus = calculateTransformerStatus(phaseA, phaseB, phaseC, totalLoad);
  
  // Update sensors
  const sensors = updateSensorReadings(
    state.sensors,
    phaseA,
    phaseB,
    phaseC,
    transformerStatus,
    neutralCurrent,
    frequency
  );
  
  // Generate AI analysis periodically
  let aiAnalysis = state.aiAnalysis;
  if (newTime % 60 === 0) {
    aiAnalysis = generateAIAnalysis(phaseA, phaseB, phaseC, neutralCurrent, transformerStatus, imbalance, frequency);
  }
  
  // Check reverse power flow
  const reversePowerFlow = checkReversePowerFlow(totalSolar, totalLoad);
  
  // Generate alerts
  const newAlerts = generateAlerts(phaseA, phaseB, phaseC, neutralCurrent, imbalance, frequency, transformerStatus, settings);
  const allAlerts = [...newAlerts, ...state.alerts].slice(0, 100);
  
  return {
    ...state,
    time: newTime,
    frequency,
    phaseA,
    phaseB,
    phaseC,
    neutralCurrent,
    houses,
    totalSolarGeneration: Math.round(totalSolar * 10) / 10,
    totalLoad: Math.round(totalLoad * 10) / 10,
    phaseImbalance: imbalance,
    alerts: allAlerts,
    transformerStatus,
    sensors,
    aiAnalysis,
    reversePowerFlow,
    cloudCover: clampedCloud,
  };
};

// Create initial state
export const createInitialState = (
  houseCount: number = 50,
  weather: WeatherCondition = 'sunny'
): SimulationState => {
  const houses = generateHouses(houseCount, weather);
  
  const phaseA = calculatePhaseData(houses, 'A', 43200, false, 0);
  const phaseB = calculatePhaseData(houses, 'B', 43200, false, 0);
  const phaseC = calculatePhaseData(houses, 'C', 43200, false, 0);
  
  const neutralCurrent = calculateNeutralCurrent(phaseA, phaseB, phaseC);
  const imbalance = calculatePhaseImbalance(phaseA, phaseB, phaseC);
  const frequency = calculateFrequency(
    houses.reduce((sum, h) => sum + h.load, 0),
    houses.reduce((sum, h) => sum + h.solarOutput, 0)
  );
  const transformerStatus = calculateTransformerStatus(phaseA, phaseB, phaseC, 
    houses.reduce((sum, h) => sum + h.load, 0));
  const sensors = generateSensors();
  const aiAnalysis = generateAIAnalysis(phaseA, phaseB, phaseC, neutralCurrent, transformerStatus, imbalance, frequency);
  
  const totalSolar = houses.reduce((sum, h) => sum + h.solarOutput, 0);
  const totalLoad = houses.reduce((sum, h) => sum + h.load, 0);
  const reversePowerFlow = checkReversePowerFlow(totalSolar, totalLoad);
  
  return {
    isRunning: false,
    speed: 1,
    time: 43200, // Start at noon
    frequency,
    phaseA,
    phaseB,
    phaseC,
    neutralCurrent,
    houses,
    totalSolarGeneration: Math.round(totalSolar * 10) / 10,
    totalLoad: Math.round(totalLoad * 10) / 10,
    phaseImbalance: imbalance,
    alerts: [],
    transformerStatus,
    sensors,
    aiAnalysis,
    reversePowerFlow,
    cloudCover: weather === 'sunny' ? 10 : weather === 'cloudy' ? 60 : 90,
  };
};

// Save history record (browser only)
export const saveHistoryRecord = (record: HistoryRecord): void => {
  if (typeof window === 'undefined') return;
  const history = getHistoryRecords();
  history.push(record);
  // Keep last 1000 records
  if (history.length > 1000) {
    history.shift();
  }
  sessionStorage.setItem('gridHistory', JSON.stringify(history));
};

// Get history records (browser only)
export const getHistoryRecords = (): HistoryRecord[] => {
  if (typeof window === 'undefined') return [];
  const data = sessionStorage.getItem('gridHistory');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
};

// Save settings to localStorage (browser only)
export const saveSettings = (settings: GlobalSettings): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('gridSettings', JSON.stringify(settings));
  }
};

// Load settings from localStorage (browser only)
export const loadSettings = (): GlobalSettings => {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  const data = localStorage.getItem('gridSettings');
  if (!data) return DEFAULT_SETTINGS;
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch {
    return DEFAULT_SETTINGS;
  }
};

// Clear history (browser only)
export const clearHistory = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('gridHistory');
  }
};
