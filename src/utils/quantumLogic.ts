/**
 * Quantum Logic Utilities for SuperpositionTower
 * 
 * This module contains pure functions for quantum mechanics calculations
 * and game logic, extracted from the main SuperpositionTower component.
 */

export interface QuantumPad {
  id: number;
  state: "up" | "down" | "superposition";
  locked: boolean;
  glowing: boolean;
  phase: number; // For interference calculations
  amplitude: number;
}

export interface FloorPattern {
  required: number[];
  description: string;
}

export interface GameConfig {
  padCount: number;
  floorCount: number;
  startingPosition: number;
  timePerFloor: number;
  decoherenceTime: number;
}

// Default game configuration - makes it easy to modify game parameters
export const DEFAULT_CONFIG: GameConfig = {
  padCount: 5,
  floorCount: 5,
  startingPosition: 2, // Middle position
  timePerFloor: 180, // 3 minutes
  decoherenceTime: 10, // 10 seconds
};

// Floor patterns - each floor has a specific solution
export const FLOOR_PATTERNS: FloorPattern[] = [
  { required: [2], description: "Create superposition in the center pad" },
  {
    required: [1, 3],
    description: "Two adjacent superposition states for constructive interference",
  },
  {
    required: [0, 2, 4],
    description: "Alternating pattern creates stable quantum bridge",
  },
  {
    required: [1, 2, 3],
    description: "Three consecutive pads form perfect interference pattern",
  },
  {
    required: [0, 1, 3, 4],
    description: "Four-pad configuration for maximum quantum coherence",
  },
];

/**
 * Generates quantum pads for a specific floor with solvable initial states
 */
export const generateQuantumPads = (
  floorIndex: number,
  showHints: boolean = true,
  config: GameConfig = DEFAULT_CONFIG
): QuantumPad[] => {
  const pattern = FLOOR_PATTERNS[floorIndex];
  const newPads: QuantumPad[] = [];

  for (let i = 0; i < config.padCount; i++) {
    const isRequired = pattern.required.includes(i);

    // For required pads, ensure they have compatible phases for constructive interference
    let phase = 0;
    if (isRequired && pattern.required.length > 1) {
      // Calculate phase to ensure constructive interference in sequence
      const sequenceIndex = pattern.required.indexOf(i);
      // Use phases that will result in constructive interference
      phase = ((sequenceIndex * Math.PI) / 4) % (2 * Math.PI);
    } else {
      // Non-required pads can have random phases
      phase = Math.random() * 2 * Math.PI;
    }

    newPads.push({
      id: i,
      state: Math.random() > 0.5 ? "up" : "down", // Start with classical states
      locked: false,
      glowing: isRequired && showHints,
      phase: phase,
      amplitude: 1.0,
    });
  }

  return newPads;
};

/**
 * Generates a deterministic solvable state as fallback
 */
export const generateDeterministicSolvableState = (
  floorIndex: number,
  showHints: boolean = true,
  config: GameConfig = DEFAULT_CONFIG
): QuantumPad[] => {
  const pattern = FLOOR_PATTERNS[floorIndex];
  const newPads: QuantumPad[] = [];

  for (let i = 0; i < config.padCount; i++) {
    const isRequired = pattern.required.includes(i);

    newPads.push({
      id: i,
      state: i % 2 === 0 ? "up" : "down", // Alternating pattern for determinism
      locked: false,
      glowing: isRequired && showHints,
      phase: isRequired ? 0 : Math.PI / 4, // Ensure constructive interference for required pads
      amplitude: 1.0,
    });
  }

  return newPads;
};

/**
 * Function to validate if current state can reach the target pattern
 */
export const isStateReachable = (
  pads: QuantumPad[],
  targetPattern: number[]
): boolean => {
  // Check if we can create the required superposition states with constructive interference
  for (let i = 0; i < targetPattern.length - 1; i++) {
    const pad1Id = targetPattern[i];
    const pad2Id = targetPattern[i + 1];
    const pad1 = pads[pad1Id];
    const pad2 = pads[pad2Id];

    // Simulate what would happen if both pads were in superposition
    // Check if their phases would allow constructive interference
    const phaseDiff = Math.abs(pad1.phase - pad2.phase);
    const wouldHaveConstructiveInterference =
      phaseDiff < Math.PI / 2 || phaseDiff > (3 * Math.PI) / 2;

    if (!wouldHaveConstructiveInterference) {
      return false;
    }
  }
  return true;
};

/**
 * Calculate interference between two pads
 */
export const calculateInterference = (
  pad1: number,
  pad2: number,
  pads: QuantumPad[]
): "constructive" | "destructive" => {
  const phase1 = pads[pad1]?.phase || 0;
  const phase2 = pads[pad2]?.phase || 0;
  const phaseDifference = Math.abs(phase1 - phase2);

  // Constructive if phases are similar (within π/2)
  return phaseDifference < Math.PI / 2 || phaseDifference > (3 * Math.PI) / 2
    ? "constructive"
    : "destructive";
};

/**
 * Check if a quantum path has constructive interference
 */
export const checkConstructiveInterference = (
  path: number[], 
  pads: QuantumPad[]
): boolean => {
  if (path.length < 2) return true;

  // Check all adjacent pairs in the path
  for (let i = 0; i < path.length - 1; i++) {
    const interference = calculateInterference(path[i], path[i + 1], pads);
    if (interference === "destructive") return false;
  }
  return true;
};

/**
 * Calculate final score based on performance metrics
 */
export const calculateScore = (
  attempts: number,
  timeUsed: number,
  baseScore: number = 1500
): number => {
  return Math.max(
    baseScore - attempts * 50 - Math.floor(timeUsed / 1000),
    200
  );
};

/**
 * Get CSS classes for pad color based on state
 */
export const getPadColor = (pad: QuantumPad, quantumStateCollapsed: boolean = false): string => {
  if (quantumStateCollapsed) {
    return "from-red-600 to-red-800 animate-pulse";
  }
  if (pad.locked) {
    return "from-green-500 to-emerald-500";
  }
  if (pad.glowing && pad.state !== "superposition") {
    return "from-yellow-400 to-orange-400 animate-pulse";
  }

  switch (pad.state) {
    case "up":
      return "from-blue-500 to-blue-600";
    case "down":
      return "from-red-500 to-red-600";
    case "superposition":
      return "from-purple-500 to-pink-500 animate-pulse";
    default:
      return "from-gray-500 to-gray-600";
  }
};

/**
 * Get quantum state label for display
 */
export const getQuantumStateLabel = (state: string): string => {
  switch (state) {
    case "up":
      return "|0⟩";
    case "down":
      return "|1⟩";
    case "superposition":
      return "(|0⟩ + |1⟩)/√2";
    default:
      return "";
  }
};

/**
 * Apply Hadamard gate transformation to a pad
 */
export const applyHadamardTransformation = (pad: QuantumPad): QuantumPad => {
  let newState: "up" | "down" | "superposition";
  let newPhase = pad.phase;
  let newAmplitude = pad.amplitude;

  if (pad.state === "up") {
    // |0⟩ → (|0⟩ + |1⟩)/√2
    newState = "superposition";
    newPhase = 0; // In-phase superposition
    newAmplitude = 1 / Math.sqrt(2);
  } else if (pad.state === "down") {
    // |1⟩ → (|0⟩ - |1⟩)/√2
    newState = "superposition";
    newPhase = Math.PI; // Out-of-phase superposition
    newAmplitude = 1 / Math.sqrt(2);
  } else {
    // Superposition → random classical state (measurement)
    newState = Math.random() > 0.5 ? "up" : "down";
    newPhase = 0;
    newAmplitude = 1.0;
  }

  return {
    ...pad,
    state: newState,
    phase: newPhase,
    amplitude: newAmplitude,
  };
};