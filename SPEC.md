# Smart Grid Simulation Dashboard - Specification

## Project Overview
- **Project Name**: SmartGridSim - Research-Level Distribution Transformer Simulator
- **Type**: Interactive Web Dashboard with Simulation Engine
- **Core Functionality**: Real-time 3-phase distribution transformer simulation with solar PV integration, power quality analysis, AI-based phase balancing, and predictive analytics
- **Target Users**: Power systems researchers, electrical engineers, utility analysts, and graduate students

## UI/UX Specification

### Layout Structure

**Page Sections**:
1. **Top Navigation Bar** (64px height)
   - Logo + App Title (left)
   - Simulation Controls (center): Start/Stop, Speed, Reset
   - Export Actions (right): PDF Report, CSV Data, Settings

2. **Main Dashboard Grid** (full remaining height)
   - Left Panel (30%): System Configuration & Controls
   - Center Panel (40%): Live Visualization (3D transformer diagram, phase meters)
   - Right Panel (30%): Metrics & Alerts

3. **Bottom Panel** (collapsible, 200px)
   - Prediction Charts & ML Insights
   - Research Report Preview

**Responsive Breakpoints**:
- Desktop: 1440px+ (full 3-column layout)
- Tablet: 1024px-1439px (2-column, stacked right panel)
- Mobile: <1024px (single column, tabbed navigation)

### Visual Design

**Color Palette**:
- Background: `#0a0f1a` (deep navy black)
- Panel Background: `#111827` (dark slate)
- Card Background: `#1f2937` (charcoal)
- Primary Accent: `#10b981` (emerald green - for healthy/optimal)
- Secondary Accent: `#3b82f6` (electric blue - for information)
- Warning: `#f59e0b` (amber)
- Critical: `#ef4444` (red)
- Phase A: `#ef4444` (red)
- Phase B: `#eab308` (yellow)
- Phase C: `#3b82f6` (blue)
- Neutral: `#a855f7` (purple)
- Text Primary: `#f9fafb`
- Text Secondary: `#9ca3af`
- Border: `#374151`

**Typography**:
- Headings: "JetBrains Mono", monospace (tech/research feel)
- Body: "IBM Plex Sans", sans-serif
- Data/Metrics: "JetBrains Mono", monospace
- Sizes: H1: 28px, H2: 22px, H3: 18px, Body: 14px, Small: 12px

**Spacing System**:
- Base unit: 4px
- Card padding: 16px
- Section gap: 24px
- Component margin: 8px

**Visual Effects**:
- Cards: subtle glow on hover (`box-shadow: 0 0 20px rgba(16, 185, 129, 0.1)`)
- Active elements: pulse animation
- Data updates: fade-in with 300ms transition
- Phase lines: animated flow particles showing power direction

### Components

**1. Transformer Visualization**
- 3D isometric view of 3-phase transformer
- Animated power flow particles
- Phase color coding (A=red, B=yellow, C=blue)
- Real-time voltage amplitude bars
- Neutral wire indicator

**2. House Solar Panel Grid**
- Configurable 30-100 houses (grid layout)
- Each house shows: panel icon, power output, connection status
- Color intensity based on generation (darker = more power)
- Phase assignment indicators

**3. Phase Meters**
- Large digital displays for V, I, PF per phase
- Circular gauge visualization
- Historical trend mini-graphs

**4. Power Quality Panel**
- Voltage (V) - per phase + neutral
- Power Factor (PF) - per phase
- THD (%) - total harmonic distortion
- Neutral Current (A)
- Real-time waveforms

**5. AI Phase Balancer Control**
- Toggle ON/OFF
- Visual feedback: converter icon with status LED
- Phase shift indicators
- Auto-balancing algorithm status

**6. IoT Alerts Feed**
- Scrolling alert list
- Alert types: INFO, WARNING, CRITICAL
- Timestamp, source, message
- Filter by type

**7. Prediction Module**
- Line charts showing:
  - Load prediction (24h)
  - Solar generation forecast
  - Phase imbalance forecast
- Confidence intervals
- ML model accuracy indicator

**8. Configuration Panel**
- Number of houses slider (30-100)
- Solar penetration percentage
- Load profile selector
- Industrial mode toggle
- Weather conditions (sunny/cloudy/rain)

**9. Research Report Preview**
- Auto-generated summary
- Key metrics cards
- Export buttons (PDF, CSV)

## Functionality Specification

### Core Features

**1. Transformer Simulation Engine**
- 3-phase balanced supply: 240V line-to-neutral, 415V line-to-line
- Configurable load per phase
- Neutral current calculation
- Phase imbalance percentage: `|Imax - Imin| / Iavg * 100`
- Real-time power calculation: P = V × I × PF

**2. Solar PV System**
- Per-house solar generation (0-5kW based on conditions)
- Variable inverter efficiency (85-98%)
- Random generation patterns based on time of day
- Total harmonic distortion from inverters

**3. Phase Imbalance Calculation**
- Current imbalance: percentage deviation
- Voltage imbalance: under IEEE 1159 standards
- Real-time calculation and display

**4. Power Quality Metrics**
- Voltage: 220-250V acceptable range
- Power Factor: 0.7-1.0 typical
- THD: <5% acceptable, >5% warning, >8% critical
- Neutral Current: <10A normal, >20A warning

**5. AI Phase Balancing Converter**
- Algorithm: Dynamic phase shifting using inverter technology
- Reduces imbalance to <5%
- Shows before/after comparison
- Power loss calculation

**6. IoT Smart Meter Simulation**
- Simulated real-time data feeds (1-second intervals)
- Alert generation based on thresholds
- Historical data storage (last 1000 readings)
- Anomaly detection

**7. ML Prediction Module**
- Simple moving average for predictions
- 24-hour ahead load forecast
- Solar generation pattern prediction
- Phase imbalance trend analysis

**8. Industrial Solar Mode**
- Higher load profiles
- Three-phase industrial loads
- Increased THD simulation
- Different phase balancing requirements

**9. Report Generation**
- Auto-summarize simulation data
- Key metrics extraction
- Chart snapshots
- PDF format (using browser print)
- CSV data export

### User Interactions

1. **Start/Stop Simulation**: Toggle real-time updates
2. **Adjust Speed**: 1x, 2x, 5x, 10x simulation speed
3. **Configure Houses**: Slider to add/remove houses
4. **Toggle AI Balancer**: Enable/disable phase balancing
5. **Switch Modes**: Residential/Industrial
6. **Weather Selection**: Affects solar generation
7. **Export Data**: PDF report or CSV download
8. **View Alerts**: Click to see details, filter by type

### Data Handling

- All simulation data generated client-side
- UseState for real-time state
- useEffect for simulation loop
- LocalStorage for saving configurations
- No backend required

### Edge Cases

- Handle 0 houses (show warning)
- Handle extreme imbalance (>50%)
- Handle 0% solar (night simulation)
- Handle AI balancer when already balanced
- Prevent negative values in calculations
- Cap maximum values to prevent overflow

## Acceptance Criteria

1. ✓ Dashboard loads with default configuration (50 houses, residential mode)
2. ✓ Transformer visualization shows 3 phases with animated power flow
3. ✓ House grid displays 30-100 houses with solar indicators
4. ✓ Phase imbalance calculates and displays correctly
5. ✓ All power quality metrics update in real-time
6. ✓ AI balancer reduces phase imbalance when enabled
7. ✓ Alerts appear based on threshold violations
8. ✓ Prediction charts show forecasted data
9. ✓ Industrial mode changes load characteristics
10. ✓ PDF/CSV export generates downloadable files
11. ✓ Responsive design works on tablet and mobile
12. ✓ Simulation can be started, stopped, and reset
13. ✓ All controls are functional and responsive

## Technical Implementation Notes

- Use React hooks for state management
- Canvas or SVG for transformer visualization
- CSS animations for power flow
- Chart library for predictions (recharts or chart.js)
- Tailwind CSS for styling
- No external API calls - all simulation client-side
