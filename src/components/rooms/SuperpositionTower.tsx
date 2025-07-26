import React, { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import { useGame } from "../../contexts/GameContext";
import {
  QuantumPad as QuantumPadType,
  DEFAULT_CONFIG,
  FLOOR_PATTERNS,
  generateQuantumPads,
  generateDeterministicSolvableState,
  isStateReachable,
  calculateInterference,
  checkConstructiveInterference,
  calculateScore,
  applyHadamardTransformation,
} from "../../utils/quantumLogic";
import {
  TutorialModal,
  VictoryModal,
  ControlPanel,
  QuantumPad,
} from "./SuperpositionTower/index";

interface PathSegment {
  from: number;
  to: number;
  stable: boolean;
}

const SuperpositionTower: React.FC = () => {
  const { completeRoom, logQuantumMeasurement } = useGame();
  const [currentFloor, setCurrentFloor] = useState(0);
  const [playerPosition, setPlayerPosition] = useState(DEFAULT_CONFIG.startingPosition);
  const [quantumPads, setQuantumPads] = useState<QuantumPadType[]>([]);
  const [selectedPath, setSelectedPath] = useState<number[]>([]);
  const [pathSegments, setPathSegments] = useState<PathSegment[]>([]);
  const [roomCompleted, setRoomCompleted] = useState(false);
  const [showHints, setShowHints] = useState(true);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_CONFIG.timePerFloor);
  const [gameStarted, setGameStarted] = useState(false);
  const [roomStartTime] = useState(Date.now());
  const [attempts, setAttempts] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [lastError, setLastError] = useState("");
  const [pathStable, setPathStable] = useState(true);
  const [decoherenceTimer, setDecoherenceTimer] = useState(DEFAULT_CONFIG.decoherenceTime);
  const [interferencePattern, setInterferencePattern] = useState<
    "constructive" | "destructive" | "none"
  >("none");
  const [quantumStateCollapsed, setQuantumStateCollapsed] = useState(false);
  const [showQuantumAnimation, setShowQuantumAnimation] = useState(false);

  // Enhanced error feedback with impossible state detection
  const handleImpossibleState = () => {
    setLastError(
      "⚠️ Current configuration detected as impossible! The quantum phases prevent the required interference pattern. Generating new solvable state...",
    );
    setTimeout(() => {
      resetPath();
    }, 2000);
  };

  // Initialize quantum pads for current floor
  useEffect(() => {
    let newPads: QuantumPadType[];
    const pattern = FLOOR_PATTERNS[currentFloor];
    let attempts = 0;
    const maxAttempts = 10;

    // Try to generate a solvable state, with fallback to guaranteed solvable configuration
    do {
      newPads = generateQuantumPads(currentFloor, showHints);
      attempts++;
    } while (
      !isStateReachable(newPads, pattern.required) &&
      attempts < maxAttempts
    );

    // If we couldn't generate a random solvable state, use a deterministic one
    if (attempts >= maxAttempts) {
      console.warn(
        `Could not generate random solvable state for floor ${currentFloor + 1}, using deterministic configuration`,
      );
      newPads = generateDeterministicSolvableState(currentFloor, showHints);
    }

    setQuantumPads(newPads);
    setSelectedPath([]);
    setPathSegments([]);
    setPlayerPosition(DEFAULT_CONFIG.startingPosition);
    setLastError("");
    setPathStable(true);
    setDecoherenceTimer(DEFAULT_CONFIG.decoherenceTime);
    setInterferencePattern("none");
    setQuantumStateCollapsed(false);
  }, [currentFloor, showHints]);

  // Timer countdown
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !roomCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      triggerDecoherence(
        "Time's up! Quantum state collapsed due to environmental decoherence.",
      );
    }
  }, [gameStarted, timeLeft, roomCompleted]);

  // Decoherence timer when path is unstable
  useEffect(() => {
    if (!pathStable && decoherenceTimer > 0) {
      const timer = setTimeout(() => {
        setDecoherenceTimer((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (decoherenceTimer === 0 && !pathStable) {
      triggerDecoherence(
        "Decoherence complete! Quantum superposition collapsed.",
      );
    }
  }, [pathStable, decoherenceTimer]);

  const startGame = () => {
    setGameStarted(true);
    setShowTutorial(false);
    setTimeLeft(DEFAULT_CONFIG.timePerFloor);
  };

  const applyHadamardGate = (padId: number) => {
    if (quantumPads[padId].locked || quantumStateCollapsed) return;

    setShowQuantumAnimation(true);
    setTimeout(() => setShowQuantumAnimation(false), 1000);

    setQuantumPads((prev) =>
      prev.map((pad) => {
        if (pad.id === padId) {
          return applyHadamardTransformation(pad);
        }
        return pad;
      }),
    );

    // Update quantum clue board
    if (quantumPads[padId].state !== "superposition") {
      setLastError(
        `✨ Hadamard transformation applied to Pad ${padId + 1}! Quantum superposition created.`,
      );
    } else {
      setLastError(
        `📏 Quantum measurement performed on Pad ${padId + 1}! Superposition collapsed to classical state.`,
      );
    }
  };

  const stepOnPad = async (padId: number) => {
    if (quantumStateCollapsed) return;

    const pad = quantumPads[padId];
    const pattern = FLOOR_PATTERNS[currentFloor];

    // Log quantum interaction
    await logQuantumMeasurement("superposition-tower", "pad_interaction", {
      pad_id: padId,
      pad_state: pad.state,
      floor: currentFloor,
      player_position: playerPosition,
      timestamp: new Date().toISOString(),
    });

    // Check if pad is in superposition
    if (pad.state !== "superposition") {
      triggerDecoherence(
        `❌ Cannot step on classical state! Pad ${padId + 1} is in ${pad.state === "up" ? "|0⟩" : "|1⟩"} state. Only superposition states can support quantum tunneling.`,
      );
      setAttempts((prev) => prev + 1);
      return;
    }

    // Check if this pad is part of the correct pattern
    if (!pattern.required.includes(padId)) {
      triggerDecoherence(
        `❌ Wrong quantum path! Stepping on Pad ${padId + 1} creates destructive interference. The quantum bridge collapses!`,
      );
      return;
    }

    // Check if this is the next correct step in sequence
    const nextRequiredPad = pattern.required[selectedPath.length];
    if (padId !== nextRequiredPad) {
      triggerDecoherence(
        `❌ Incorrect sequence! You must step on Pad ${nextRequiredPad + 1} next to maintain quantum coherence.`,
      );
      return;
    }

    // Successful step!
    const newPath = [...selectedPath, padId];
    setSelectedPath(newPath);
    setPlayerPosition(padId);
    setLastError("");

    // Lock the pad and create path segment
    setQuantumPads((prev) =>
      prev.map((pad) => (pad.id === padId ? { ...pad, locked: true } : pad)),
    );

    // Add path segment with interference calculation
    if (selectedPath.length > 0) {
      const lastPad = selectedPath[selectedPath.length - 1];
      const interference = calculateInterference(lastPad, padId, quantumPads);
      setPathSegments((prev) => [
        ...prev,
        { from: lastPad, to: padId, stable: interference === "constructive" },
      ]);
      setInterferencePattern(interference);
    }

    // Check for constructive interference
    if (newPath.length >= 2) {
      const hasConstructiveInterference = checkConstructiveInterference(newPath, quantumPads);
      if (!hasConstructiveInterference) {
        setPathStable(false);
        setDecoherenceTimer(DEFAULT_CONFIG.decoherenceTime);
        setLastError(
          "⚠️ Quantum path unstable! Destructive interference detected. Decoherence timer started!",
        );
      } else {
        setLastError(
          `✅ Constructive interference achieved! Quantum bridge segment ${newPath.length}/${pattern.required.length} stable.`,
        );
      }
    }

    // Check if floor is complete
    if (newPath.length === pattern.required.length) {
      setTimeout(() => {
        setLastError(
          `🎉 Floor ${currentFloor + 1} completed! Perfect quantum interference pattern achieved.`,
        );
        if (currentFloor < DEFAULT_CONFIG.floorCount - 1) {
          setTimeout(() => {
            setCurrentFloor((prev) => prev + 1);
            setTimeLeft(DEFAULT_CONFIG.timePerFloor); // Reset timer for next floor
          }, 2000);
        } else {
          setTimeout(async () => {
            setRoomCompleted(true);

            // Calculate completion metrics
            const completionTime = Date.now() - roomStartTime;
            const score = calculateScore(attempts, completionTime);

            // Log final quantum state measurement
            await logQuantumMeasurement(
              "superposition-tower",
              "tower_completion",
              {
                floors_completed: DEFAULT_CONFIG.floorCount,
                final_path: selectedPath,
                completion_time: completionTime,
                total_attempts: attempts,
              },
            );

            // Complete room with metrics
            await completeRoom("superposition-tower", {
              time: completionTime,
              attempts: attempts,
              score: score,
            });
          }, 2000);
        }
      }, 1000);
    }
  };

  const triggerDecoherence = (message: string) => {
    setQuantumStateCollapsed(true);
    setPathStable(false);
    setLastError(message);
    setAttempts((prev) => prev + 1);

    // Reset after showing decoherence effect
    setTimeout(() => {
      resetPath();
    }, 3000);
  };

  const resetPath = () => {
    setSelectedPath([]);
    setPathSegments([]);
    setPlayerPosition(DEFAULT_CONFIG.startingPosition);
    setPathStable(true);
    setDecoherenceTimer(DEFAULT_CONFIG.decoherenceTime);
    setInterferencePattern("none");
    setQuantumStateCollapsed(false);
    setLastError(
      "🔄 Quantum system reset with guaranteed solvable configuration.",
    );

    // Generate a new solvable state instead of completely random
    const pattern = FLOOR_PATTERNS[currentFloor];
    let newPads: QuantumPadType[];
    let attempts = 0;
    const maxAttempts = 5;

    do {
      newPads = generateQuantumPads(currentFloor, showHints);
      attempts++;
    } while (
      !isStateReachable(newPads, pattern.required) &&
      attempts < maxAttempts
    );

    // If we couldn't generate a random solvable state, use a deterministic one
    if (attempts >= maxAttempts) {
      newPads = generateDeterministicSolvableState(currentFloor, showHints);
    }

    setQuantumPads(newPads);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Room Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🗼</div>
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            SUPERPOSITION TOWER
          </h1>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Master quantum superposition and wave interference to escape the
            tower. Create stable quantum bridges by applying Hadamard
            transformations and stepping only on superposition states that
            exhibit constructive interference.
          </p>
        </div>

        {/* Tutorial Modal */}
        {showTutorial && <TutorialModal onStart={startGame} />}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quantum Control Panel */}
          <ControlPanel
            currentFloor={currentFloor}
            totalFloors={DEFAULT_CONFIG.floorCount}
            timeLeft={timeLeft}
            quantumPads={quantumPads}
            pathStable={pathStable}
            decoherenceTimer={decoherenceTimer}
            interferencePattern={interferencePattern}
            attempts={attempts}
            showHints={showHints}
            onToggleHints={() => setShowHints(!showHints)}
            onReset={resetPath}
            onGenerateSolvableState={handleImpossibleState}
          />

          {/* Tower Visualization */}
          <div className="lg:col-span-2 bg-gray-800/30 backdrop-blur-sm rounded-2xl border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">
                Quantum Bridge Platform
              </h2>
              <div className="text-sm text-gray-400">
                Progress: {selectedPath.length}/
                {FLOOR_PATTERNS[currentFloor].required.length} pads
              </div>
            </div>

            {/* Error/Success Messages */}
            {lastError && (
              <div
                className={`mb-6 p-4 rounded-xl border ${
                  lastError.includes("❌") || lastError.includes("⚠️")
                    ? "bg-red-900/30 border-red-500"
                    : lastError.includes("✅") || lastError.includes("🎉")
                      ? "bg-green-900/30 border-green-500"
                      : lastError.includes("✨")
                        ? "bg-purple-900/30 border-purple-500"
                        : "bg-blue-900/30 border-blue-500"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    lastError.includes("❌") || lastError.includes("⚠️")
                      ? "text-red-300"
                      : lastError.includes("✅") || lastError.includes("🎉")
                        ? "text-green-300"
                        : lastError.includes("✨")
                          ? "text-purple-300"
                          : "text-blue-300"
                  }`}
                >
                  {lastError}
                </p>
              </div>
            )}

            {/* Quantum Pads Grid */}
            <div className="relative mb-8">
              <div className="grid grid-cols-5 gap-4 mb-8">
                {quantumPads.map((pad) => (
                  <QuantumPad
                    key={pad.id}
                    pad={pad}
                    playerPosition={playerPosition}
                    quantumStateCollapsed={quantumStateCollapsed}
                    showHints={showHints}
                    onStepOn={stepOnPad}
                    onApplyHadamard={applyHadamardGate}
                  />
                ))}
              </div>

              {/* Quantum Path Visualization */}
              {pathSegments.length > 0 && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    {pathSegments.map((segment, index) => {
                      const fromX = (segment.from % 5) * 20 + 10;
                      const fromY = 50;
                      const toX = (segment.to % 5) * 20 + 10;
                      const toY = 50;

                      return (
                        <line
                          key={index}
                          x1={`${fromX}%`}
                          y1={`${fromY}%`}
                          x2={`${toX}%`}
                          y2={`${toY}%`}
                          stroke={segment.stable ? "#10b981" : "#ef4444"}
                          strokeWidth="3"
                          strokeDasharray={segment.stable ? "0" : "5,5"}
                          className={segment.stable ? "" : "animate-pulse"}
                        />
                      );
                    })}
                  </svg>
                </div>
              )}

              {/* Player Avatar */}
              <div className="text-center mb-6">
                <div
                  className={`inline-block w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-400
                               rounded-full flex items-center justify-center text-2xl transition-all duration-300
                               ${quantumStateCollapsed ? "animate-bounce" : "animate-pulse"}`}
                >
                  🧑‍🚀
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Quantum Explorer (Position: Pad {playerPosition + 1})
                </p>
              </div>

              {/* Path Progress Display */}
              {selectedPath.length > 0 && (
                <div className="mt-6 p-4 bg-green-900/30 border border-green-500 rounded-xl">
                  <h3 className="font-semibold mb-2 text-green-300 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Quantum Bridge Progress:
                  </h3>
                  <div className="flex items-center space-x-2 flex-wrap mb-2">
                    {selectedPath.map((padId, index) => (
                      <React.Fragment key={padId}>
                        <div className="px-3 py-1 bg-green-500 rounded-full text-sm font-semibold">
                          Pad {padId + 1}
                        </div>
                        {index < selectedPath.length - 1 && (
                          <div className="text-green-400">→</div>
                        )}
                      </React.Fragment>
                    ))}
                    {selectedPath.length <
                      FLOOR_PATTERNS[currentFloor].required.length && (
                      <>
                        <div className="text-green-400">→</div>
                        <div className="px-3 py-1 bg-gray-600 rounded-full text-sm">
                          Pad{" "}
                          {FLOOR_PATTERNS[currentFloor].required[
                            selectedPath.length
                          ] + 1}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="text-sm space-y-1">
                    <div className="text-green-400">
                      ✓ Quantum Coherence: {selectedPath.length}/
                      {FLOOR_PATTERNS[currentFloor].required.length}
                    </div>
                    <div
                      className={pathStable ? "text-green-400" : "text-red-400"}
                    >
                      {pathStable
                        ? "✓ Constructive Interference"
                        : "✗ Destructive Interference"}
                    </div>
                  </div>
                </div>
              )}

              {/* Room Completion */}
              {roomCompleted && (
                <VictoryModal 
                  attempts={attempts}
                  timeUsed={DEFAULT_CONFIG.timePerFloor - timeLeft}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperpositionTower;
