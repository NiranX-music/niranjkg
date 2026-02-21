// Smart Grid Simulation Engine
// Research-level 3-phase distribution transformer simulation

export interface PhaseData {
  voltage: number;
  current: number;
  powerFactor: number;
  power: number;
  thd: number;
}

export interface HouseData {
  id: number;
  phase: 'A' | 'B' | 'C';
  solarOutput: number;
  load: number;
  isActive: boolean;
}

export interface Alert {
  id: string;
  type: 'INFO' | 'WARNING' | 'CRITICAL';
  timestamp: Date;
  source: string;
  message: string;
}

export interface SimulationState {
  isRunning: boolean;
  speed: number;
  time: number;
  phaseA: PhaseData;
  phaseB: PhaseData;
  phaseC: PhaseData;
  neutralCurrent: number;
  houses: HouseData[];
  totalSolarGeneration: number;
  totalLoad: number;
  phaseImbalance: number;
  alerts: Alert[];
}

export interface PredictionData {
  time: number;
  load: number;
  solar: number;
  imbalance: number;
}

export type WeatherCondition = 'sunny' | 'cloudy' | 'rainy';
export type LoadProfile = 'residential' | 'industrial';
export type SimulationMode = 'running' | 'paused' | 'stopped';

const BASE_VOLTAGE = 240; // Line-to-neutral

// Generate random value within range
const randomInRange = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Generate houses based on count
export const generateHouses = (count: number, weather: WeatherCondition): HouseData[] => {
  const houses: HouseData[] = [];
  const phases: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  
  for (let i = 0; i < count; i++) {
    const phase = phases[i % 3];
    const baseSolar = weather === 'sunny' ? 4 : weather === 'cloudy' ? 2 : 0.5;
    const solarOutput = randomInRange(0, baseSolar);
    const baseLoad = 1.5;
    
    houses.push({
      id: i + 1,
      phase,
      solarOutput,
      load: randomInRange(0.5, baseLoad),
      isActive: Math.random() > 0.1,
    });
  }
  
  return houses;
};

// Calculate phase data based on houses
export const calculatePhaseData = (
  houses: HouseData[],
  phase: 'A' | 'B' | 'C',
  time: number,
  industrialMode: boolean
): PhaseData => {
  const phaseHouses = houses.filter(h => h.phase === phase && h.isActive);
  
  let totalLoad = phaseHouses.reduce((sum, h) => sum + h.load, 0);
  let totalSolar = phaseHouses.reduce((sum, h) => sum + h.solarOutput, 0);
  
  // Time-based variation (simulate day/night cycle)
  const hourOfDay = (time / 3600) % 24;
  const solarMultiplier = hourOfDay >= 6 && hourOfDay <= 18 
    ? Math.sin((hourOfDay - 6) * Math.PI / 12) 
    : 0;
  
  totalSolar *= solarMultiplier;
  
  // Industrial mode adds significant base load
  if (industrialMode) {
    totalLoad += randomInRange(20, 40);
  }
  
  // Net current (load - solar)
  const netCurrent = Math.max(0, totalLoad - totalSolar * 0.8);
  
  // Power factor calculation
  let powerFactor = randomInRange(0.75, 0.95);
  if (industrialMode) {
    powerFactor = randomInRange(0.65, 0.85);
  }
  
  // THD calculation (higher with more solar/inverters)
  const thd = Math.min(15, totalSolar * 2 + randomInRange(0, 3));
  
  // Voltage drop based on current
  const voltageDrop = netCurrent * 0.05;
  const voltage = BASE_VOLTAGE - voltageDrop + randomInRange(-2, 2);
  
  return {
    voltage: Math.round(voltage * 10) / 10,
    current: Math.round(netCurrent * 10) / 10,
    powerFactor: Math.round(powerFactor * 100) / 100,
    power: Math.round(voltage * netCurrent * powerFactor),
    thd: Math.round(thd * 10) / 10,
  };
};

// Calculate neutral current (unbalance indicator)
export const calculateNeutralCurrent = (phaseA: PhaseData, phaseB: PhaseData, phaseC: PhaseData): number => {
  const currents = [phaseA.current, phaseB.current, phaseC.current];
  
  // Neutral current is proportional to phase imbalance
  const imbalance = Math.max(...currents) - Math.min(...currents);
  const neutralCurrent = imbalance * 0.5 + randomInRange(0, 2);
  
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
  
  return {
    phaseA: { ...phaseA, current: Math.round(balancedCurrents[0] * 10) / 10 },
    phaseB: { ...phaseB, current: Math.round(balancedCurrents[1] * 10) / 10 },
    phaseC: { ...phaseC, current: Math.round(balancedCurrents[2] * 10) / 10 },
  };
};

// Generate alerts based on system state
export const generateAlerts = (
  phaseA: PhaseData,
  phaseB: PhaseData,
  phaseC: PhaseData,
  neutralCurrent: number,
  imbalance: number
): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  
  // Voltage alerts
  [phaseA, phaseB, phaseC].forEach((phase, index) => {
    const phaseName = ['A', 'B', 'C'][index];
    if (phase.voltage < 220) {
      alerts.push({
        id: `v-${now.getTime()}-${index}`,
        type: 'CRITICAL',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `Under-voltage: ${phase.voltage}V (threshold: 220V)`,
      });
    } else if (phase.voltage < 230) {
      alerts.push({
        id: `v-${now.getTime()}-${index}`,
        type: 'WARNING',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `Low voltage: ${phase.voltage}V`,
      });
    }
  });
  
  // THD alerts
  [phaseA, phaseB, phaseC].forEach((phase, index) => {
    const phaseName = ['A', 'B', 'C'][index];
    if (phase.thd > 8) {
      alerts.push({
        id: `thd-${now.getTime()}-${index}`,
        type: 'CRITICAL',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `High THD: ${phase.thd}% (threshold: 8%)`,
      });
    } else if (phase.thd > 5) {
      alerts.push({
        id: `thd-${now.getTime()}-${index}`,
        type: 'WARNING',
        timestamp: now,
        source: `Phase ${phaseName}`,
        message: `Elevated THD: ${phase.thd}%`,
      });
    }
  });
  
  // Neutral current alerts
  if (neutralCurrent > 20) {
    alerts.push({
      id: `n-${now.getTime()}`,
      type: 'CRITICAL',
      timestamp: now,
      source: 'Neutral',
      message: `High neutral current: ${neutralCurrent}A`,
    });
  } else if (neutralCurrent > 10) {
    alerts.push({
      id: `n-${now.getTime()}`,
      type: 'WARNING',
      timestamp: now,
      source: 'Neutral',
      message: `Elevated neutral current: ${neutralCurrent}A`,
    });
  }
  
  // Phase imbalance alerts
  if (imbalance > 30) {
    alerts.push({
      id: `imb-${now.getTime()}`,
      type: 'CRITICAL',
      timestamp: now,
      source: 'System',
      message: `Severe phase imbalance: ${imbalance}%`,
    });
  } else if (imbalance > 15) {
    alerts.push({
      id: `imb-${now.getTime()}`,
      type: 'WARNING',
      timestamp: now,
      source: 'System',
      message: `Phase imbalance detected: ${imbalance}%`,
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

// Update simulation state
export const updateSimulation = (
  state: SimulationState,
  config: {
    houseCount: number;
    weather: WeatherCondition;
    industrialMode: boolean;
    aiBalancerEnabled: boolean;
  }
): SimulationState => {
  const newTime = state.time + 1 * state.speed;
  
  // Regenerate house data periodically for variation
  const houses = newTime % 60 === 0 
    ? generateHouses(config.houseCount, config.weather)
    : state.houses.map(h => ({
        ...h,
        solarOutput: h.solarOutput * (0.95 + Math.random() * 0.1),
        load: h.load * (0.98 + Math.random() * 0.04),
      }));
  
  // Calculate phase data
  let phaseA = calculatePhaseData(houses, 'A', newTime, config.industrialMode);
  let phaseB = calculatePhaseData(houses, 'B', newTime, config.industrialMode);
  let phaseC = calculatePhaseData(houses, 'C', newTime, config.industrialMode);
  
  // Apply AI balancer
  const balanced = applyPhaseBalancing(phaseA, phaseB, phaseC, config.aiBalancerEnabled);
  phaseA = balanced.phaseA;
  phaseB = balanced.phaseB;
  phaseC = balanced.phaseC;
  
  const neutralCurrent = calculateNeutralCurrent(phaseA, phaseB, phaseC);
  const imbalance = calculatePhaseImbalance(phaseA, phaseB, phaseC);
  
  // Generate alerts
  const newAlerts = generateAlerts(phaseA, phaseB, phaseC, neutralCurrent, imbalance);
  const allAlerts = [...newAlerts, ...state.alerts].slice(0, 100);
  
  const totalSolar = houses.reduce((sum, h) => sum + h.solarOutput, 0);
  const totalLoad = houses.reduce((sum, h) => sum + h.load, 0);
  
  return {
    ...state,
    time: newTime,
    phaseA,
    phaseB,
    phaseC,
    neutralCurrent,
    houses,
    totalSolarGeneration: Math.round(totalSolar * 10) / 10,
    totalLoad: Math.round(totalLoad * 10) / 10,
    phaseImbalance: imbalance,
    alerts: allAlerts,
  };
};

// Create initial state
export const createInitialState = (
  houseCount: number = 50,
  weather: WeatherCondition = 'sunny'
): SimulationState => {
  const houses = generateHouses(houseCount, weather);
  
  const phaseA = calculatePhaseData(houses, 'A', 0, false);
  const phaseB = calculatePhaseData(houses, 'B', 0, false);
  const phaseC = calculatePhaseData(houses, 'C', 0, false);
  
  const neutralCurrent = calculateNeutralCurrent(phaseA, phaseB, phaseC);
  const imbalance = calculatePhaseImbalance(phaseA, phaseB, phaseC);
  
  const totalSolar = houses.reduce((sum, h) => sum + h.solarOutput, 0);
  const totalLoad = houses.reduce((sum, h) => sum + h.load, 0);
  
  return {
    isRunning: false,
    speed: 1,
    time: 43200, // Start at noon
    phaseA,
    phaseB,
    phaseC,
    neutralCurrent,
    houses,
    totalSolarGeneration: Math.round(totalSolar * 10) / 10,
    totalLoad: Math.round(totalLoad * 10) / 10,
    phaseImbalance: imbalance,
    alerts: [],
  };
};
